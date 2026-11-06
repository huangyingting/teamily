import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { ensureSystemAgents } from "@/lib/workspace-provisioner";
import { AGENT_TEAMS, PLATFORM_CONNECTORS, PLATFORM_SKILLS } from "@/lib/catalog";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  await ensureSystemAgents();

  const agents = await prisma.agent.findMany({
    where: user
      ? { OR: [{ isSystem: true }, { isPublic: true }, { ownerId: user.id }] }
      : { OR: [{ isSystem: true }, { isPublic: true }] },
    orderBy: [{ isSystem: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    agents,
    agentTeams: AGENT_TEAMS,
    skills: PLATFORM_SKILLS,
    connectors: PLATFORM_CONNECTORS,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(user.role, "MEMBER")) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Viewer role cannot create custom agents" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const title = String(body.title ?? "Custom Specialist Agent").trim();
  const category = String(body.category ?? "Custom").trim();
  const description = String(body.description ?? "").trim();
  const systemPrompt = String(
    body.systemPrompt ?? `You are ${name}, a specialist AI agent on Teamily.`
  ).trim();
  const avatarEmoji = String(body.avatarEmoji ?? "🤖").trim() || "🤖";
  const avatarBg = String(body.avatarBg ?? "#087c45").trim() || "#087c45";
  const skills = Array.isArray(body.skills) ? body.skills : ["web-search", "living-wiki"];
  const connectors = Array.isArray(body.connectors) ? body.connectors : [];

  if (!name) {
    return NextResponse.json(
      { error: "INVALID_NAME", message: "Agent name is required" },
      { status: 400 }
    );
  }

  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "agent";
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  const agent = await prisma.agent.create({
    data: {
      slug,
      name,
      title,
      category,
      description: description || `${title} created by ${user.name}.`,
      systemPrompt,
      avatarEmoji,
      avatarBg,
      skillsJson: JSON.stringify(skills),
      connectorsJson: JSON.stringify(connectors),
      isSystem: false,
      isPublic: Boolean(body.isPublic ?? true),
      ownerId: user.id,
    },
  });

  await recordAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "AGENT_CREATED",
    targetType: "AGENT",
    targetId: agent.id,
    metadata: { name: agent.name, category: agent.category },
  });

  return NextResponse.json({ agent }, { status: 201 });
}
