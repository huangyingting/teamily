import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "ALL";
  const search = searchParams.get("search") ?? "";

  const where: Record<string, unknown> = { ownerId: user.id };
  if (filter === "FAVORITES") {
    where.isFavorited = true;
  } else if (filter === "DOCUMENTS") {
    where.type = "DOCUMENT";
  } else if (filter === "ARTIFACTS") {
    where.type = { in: ["HTML", "CODE", "MARKDOWN"] };
  }

  if (search.trim()) {
    where.OR = [
      { title: { contains: search.trim() } },
      { previewText: { contains: search.trim() } },
    ];
  }

  const artifacts = await prisma.artifact.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ artifacts });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(user.role, "MEMBER")) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Viewer role cannot create artifacts or cloud documents" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const title = String(body.title ?? "Untitled Cloud Document").trim() || "Untitled Cloud Document";
  const type = ["DOCUMENT", "HTML", "CODE", "MARKDOWN"].includes(body.type)
    ? body.type
    : "DOCUMENT";
  const content = String(
    body.content ??
      `<h1>${title}</h1><p>Start writing in your collaborative Teamily Cloud Document or ask an AI agent to expand this section.</p>`
  );
  const plainPreview = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);

  const artifact = await prisma.artifact.create({
    data: {
      ownerId: user.id,
      title,
      type,
      content,
      previewText: body.previewText ? String(body.previewText) : plainPreview,
      isFavorited: Boolean(body.isFavorited),
    },
  });

  // Mark Day 5 onboarding task completed
  await prisma.onboardingTask.updateMany({
    where: { userId: user.id, dayNumber: 5 },
    data: { isCompleted: true },
  });

  await recordAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "ARTIFACT_CREATED",
    targetType: "ARTIFACT",
    targetId: artifact.id,
    metadata: { title: artifact.title, type: artifact.type },
  });

  return NextResponse.json({ artifact }, { status: 201 });
}
