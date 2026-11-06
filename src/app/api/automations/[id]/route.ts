import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.automation.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.isActive === "boolean") {
    data.isActive = body.isActive;
  }
  if (typeof body.title === "string" && body.title.trim()) {
    data.title = body.title.trim();
  }
  if (typeof body.compiledPrompt === "string" && body.compiledPrompt.trim()) {
    data.compiledPrompt = body.compiledPrompt.trim();
  }
  if (typeof body.scheduleType === "string") {
    data.scheduleType = body.scheduleType;
  }
  if (typeof body.scheduleTime === "string") {
    data.scheduleTime = body.scheduleTime;
  }

  if (body.triggerNow === true) {
    data.lastRunAt = new Date();
    // Deliver automated briefing message into user's Personal Agent conversation
    const personalConv = await prisma.conversation.findFirst({
      where: { ownerId: user.id, type: "PERSONAL" },
    });
    if (personalConv) {
      await prisma.message.create({
        data: {
          conversationId: personalConv.id,
          senderType: "AGENT",
          senderName: "Teamily Automation Runner",
          mode: "Agentic",
          content: `### ⚡ Automated Run: ${existing.title}\n\n**Executed Prompt**: *${existing.compiledPrompt}*\n\n#### Key Briefing Takeaways\n1. **Priority Signal**: Synthesized latest updates across your selected focus areas.\n2. **Workspace Alignment**: Cross-checked with your **Living Wiki** priorities.\n3. **Next Action**: Review recommended follow-ups in **Memory → Next Actions**.`,
          metadataJson: JSON.stringify({
            steps: ["Triggered scheduled automation", "Delivered briefing to Personal Agent"],
            creditsUsed: 3,
          }),
        },
      });
    }
  }

  const updated = await prisma.automation.update({
    where: { id: existing.id },
    data,
  });

  return NextResponse.json({ automation: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.automation.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.automation.delete({ where: { id: existing.id } });
  return NextResponse.json({ deleted: true });
}
