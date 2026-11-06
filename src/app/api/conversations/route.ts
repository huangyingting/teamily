import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { ensureSystemAgents } from "@/lib/workspace-provisioner";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  await ensureSystemAgents();

  const [conversations, onboardingTasks, agents] = await Promise.all([
    prisma.conversation.findMany({
      where: { ownerId: user.id },
      include: {
        members: {
          include: {
            agent: {
              select: {
                id: true,
                slug: true,
                name: true,
                title: true,
                avatarEmoji: true,
                avatarBg: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.onboardingTask.findMany({
      where: { userId: user.id },
      orderBy: { dayNumber: "asc" },
    }),
    prisma.agent.findMany({
      where: {
        OR: [{ isSystem: true }, { ownerId: user.id }],
      },
      orderBy: [{ isSystem: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return NextResponse.json({
    conversations,
    onboardingTasks,
    agents,
    user,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!hasMinimumRole(user.role, "MEMBER")) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Viewer role cannot create new conversations" },
      { status: 403 }
    );
  }

  await ensureSystemAgents();
  const body = await req.json();
  const title = String(body.title ?? "New Multi-Agent Group").trim() || "New Multi-Agent Group";
  const type = body.type === "DIRECT_AGENT" || body.type === "PERSONAL" ? body.type : "GROUP";
  const mode = body.mode === "Instant" || body.mode === "Agentic" ? body.mode : "Auto";
  const agentIds: string[] = Array.isArray(body.agentIds) ? body.agentIds : [];
  const agentSlugs: string[] = Array.isArray(body.agentSlugs) ? body.agentSlugs : [];

  let selectedAgents = await prisma.agent.findMany({
    where: {
      OR: [
        ...(agentIds.length > 0 ? [{ id: { in: agentIds } }] : []),
        ...(agentSlugs.length > 0 ? [{ slug: { in: agentSlugs } }] : []),
      ],
    },
  });

  if (selectedAgents.length === 0) {
    const fallback = await prisma.agent.findFirst({
      where: { slug: "teamily-agent" },
    });
    if (fallback) selectedAgents = [fallback];
  }

  const memberCreates = [
    {
      memberType: "USER",
      userId: user.id,
      displayName: user.name,
      avatarEmoji: "👤",
    },
    ...selectedAgents.map((ag) => ({
      memberType: "AGENT",
      agentId: ag.id,
      displayName: ag.name,
      avatarEmoji: ag.avatarEmoji,
    })),
  ];

  const leadAgent = selectedAgents[0];
  const agentNamesList = selectedAgents.map((a) => `**${a.name}**`).join(", ");

  const conversation = await prisma.conversation.create({
    data: {
      title,
      type,
      mode,
      isPinned: Boolean(body.isPinned),
      ownerId: user.id,
      members: {
        create: memberCreates,
      },
      messages: {
        create: [
          {
            senderType: "AGENT",
            senderName: leadAgent?.name ?? "Teamily Agent",
            agentId: leadAgent?.id ?? null,
            mode,
            content:
              type === "GROUP"
                ? `Multi-Agent Room **"${title}"** is live with ${agentNamesList}. Share your objective, spec, or strategic question and we'll collaborate in real time.`
                : `Started a direct thread with **${leadAgent?.name ?? title}**. How can I help you today?`,
            metadataJson: JSON.stringify({
              steps: ["Initialized conversation room", `Loaded ${selectedAgents.length} specialist agent(s)`],
              creditsUsed: 0,
            }),
          },
        ],
      },
    },
    include: {
      members: {
        include: { agent: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // Mark Day 2 onboarding task completed if GROUP
  if (type === "GROUP") {
    await prisma.onboardingTask.updateMany({
      where: { userId: user.id, dayNumber: 2 },
      data: { isCompleted: true },
    });
  }

  await recordAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "CONVERSATION_CREATED",
    targetType: "CONVERSATION",
    targetId: conversation.id,
    metadata: { title, type, agentCount: selectedAgents.length },
  });

  return NextResponse.json({ conversation }, { status: 201 });
}
