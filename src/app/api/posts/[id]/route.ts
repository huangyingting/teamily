import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { SHOWCASE_COMMUNITY_POSTS } from "@/lib/catalog";
import { recordAuditLog } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const showcase = SHOWCASE_COMMUNITY_POSTS.find((s) => s.id === id);
  if (showcase) {
    return NextResponse.json({
      post: {
        ...showcase,
        createdAt: new Date("2026-03-15T10:00:00Z"),
        isOfficialShowcase: true,
      },
    });
  }

  const dbPost = await prisma.communityPost.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, handle: true, role: true },
      },
    },
  });

  if (!dbPost) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    post: {
      id: dbPost.id,
      title: dbPost.title,
      summary: dbPost.summary,
      content: dbPost.content,
      category: dbPost.category,
      likesCount: dbPost.likesCount,
      commentsCount: dbPost.commentsCount,
      createdAt: dbPost.createdAt,
      authorId: dbPost.authorId,
      authorName: dbPost.author.name,
      authorHandle: `@${dbPost.author.handle}`,
      authorEmoji: "👤",
      isOfficialShowcase: false,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  const dbPost = await prisma.communityPost.findUnique({ where: { id } });
  if (!dbPost) {
    return NextResponse.json({ liked: true });
  }

  if (body.like === true) {
    const updated = await prisma.communityPost.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
    });
    return NextResponse.json({ post: updated });
  }

  return NextResponse.json({ post: dbPost });
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
  const dbPost = await prisma.communityPost.findUnique({ where: { id } });
  if (!dbPost) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (dbPost.authorId !== user.id && !hasMinimumRole(user.role, "MODERATOR")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  await prisma.communityPost.delete({ where: { id } });

  await recordAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "POST_DELETED",
    targetType: "POST",
    targetId: id,
    metadata: { title: dbPost.title },
  });

  return NextResponse.json({ deleted: true });
}
