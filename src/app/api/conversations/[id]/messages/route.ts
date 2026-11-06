import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { generateAgentResponses } from "@/lib/agent-engine";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(user.role, "MEMBER")) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Viewer role has read-only access" },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const conversation = await prisma.conversation.findFirst({
    where: { id, ownerId: user.id },
    include: {
      members: {
        include: { agent: true },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const body = await req.json();
  const content = String(body.content ?? "").trim();
  const mode: "Auto" | "Instant" | "Agentic" =
    body.mode === "Instant" || body.mode === "Agentic" ? body.mode : "Auto";

  if (!content) {
    return NextResponse.json(
      { error: "EMPTY_MESSAGE", message: "Message content is required" },
      { status: 400 }
    );
  }

  const userMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: "USER",
      senderName: user.name,
      senderUserId: user.id,
      mode,
      content,
    },
  });

  const agentMembers = conversation.members
    .filter((m) => m.memberType === "AGENT")
    .map((m) => ({
      agentId: m.agentId,
      displayName: m.displayName,
      avatarEmoji: m.avatarEmoji,
    }));

  const replies = generateAgentResponses({
    prompt: content,
    mode,
    conversationType: conversation.type,
    agentMembers,
    userName: user.name,
  });

  const createdAgentMessages = [];
  const createdArtifacts = [];
  let totalCreditsUsed = 0;

  for (const reply of replies) {
    totalCreditsUsed += reply.creditsUsed;

    if (reply.generatedArtifact) {
      const artifact = await prisma.artifact.create({
        data: {
          ownerId: user.id,
          conversationId: conversation.id,
          title: reply.generatedArtifact.title,
          type: reply.generatedArtifact.type,
          content: reply.generatedArtifact.content,
          previewText: reply.generatedArtifact.previewText,
        },
      });
      createdArtifacts.push(artifact);
    }

    if (reply.wikiUpdate) {
      const firstWiki = await prisma.wikiPage.findFirst({
        where: { ownerId: user.id },
        orderBy: { updatedAt: "desc" },
      });
      if (firstWiki) {
        await prisma.wikiPage.update({
          where: { id: firstWiki.id },
          data: {
            content: firstWiki.content + reply.wikiUpdate.appendSection,
            version: { increment: 1 },
          },
        });
      }
    }

    const agentMsg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: "AGENT",
        senderName: reply.senderName,
        agentId: reply.agentId ?? null,
        mode,
        content: reply.content,
        metadataJson: JSON.stringify({
          steps: reply.steps,
          creditsUsed: reply.creditsUsed,
          avatarEmoji: reply.avatarEmoji,
          artifactId: createdArtifacts[0]?.id ?? null,
        }),
      },
    });
    createdAgentMessages.push(agentMsg);
  }

  // Update conversation timestamp & mode
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { mode, updatedAt: new Date() },
  });

  // Deduct credits gracefully
  if (totalCreditsUsed > 0) {
    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (freshUser) {
      const nextCredits = Math.max(0, freshUser.credits - totalCreditsUsed);
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: nextCredits },
      });
    }
  }

  return NextResponse.json({
    userMessage,
    agentMessages: createdAgentMessages,
    createdArtifacts,
  });
}
