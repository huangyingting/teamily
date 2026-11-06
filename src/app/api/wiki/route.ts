import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const [pages, onboardingTasks, automations, artifacts] = await Promise.all([
    prisma.wikiPage.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.onboardingTask.findMany({
      where: { userId: user.id },
      orderBy: { dayNumber: "asc" },
    }),
    prisma.automation.findMany({
      where: { ownerId: user.id },
      take: 10,
    }),
    prisma.artifact.findMany({
      where: { ownerId: user.id },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    pages,
    nextActions: onboardingTasks,
    automations,
    artifacts,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(user.role, "MEMBER")) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Viewer role cannot create Living Wiki pages" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const title = String(body.title ?? "Untitled Wiki Page").trim() || "Untitled Wiki Page";
  const icon = String(body.icon ?? "📄").trim() || "📄";
  const category = String(body.category ?? "General").trim() || "General";
  const content = String(
    body.content ?? `# ${title}\n\nCapture structured knowledge, decisions, and context for your AI agents here.`
  );
  const tags = Array.isArray(body.tags) ? body.tags : ["Wiki", category];

  const slugBase =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "page";
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  const page = await prisma.wikiPage.create({
    data: {
      ownerId: user.id,
      title,
      slug,
      icon,
      category,
      content,
      tagsJson: JSON.stringify(tags),
    },
  });

  // Mark Day 4 onboarding task completed
  await prisma.onboardingTask.updateMany({
    where: { userId: user.id, dayNumber: 4 },
    data: { isCompleted: true },
  });

  await recordAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "WIKI_CREATED",
    targetType: "WIKI",
    targetId: page.id,
    metadata: { title: page.title, category: page.category },
  });

  return NextResponse.json({ page }, { status: 201 });
}
