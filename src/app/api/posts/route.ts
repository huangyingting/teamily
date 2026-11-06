import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { SHOWCASE_COMMUNITY_POSTS } from "@/lib/catalog";
import { recordAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const dbPosts = await prisma.communityPost.findMany({
    where: category && category !== "All" ? { category } : {},
    include: {
      author: {
        select: {
          id: true,
          name: true,
          handle: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  const formattedDbPosts = dbPosts.map((p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary || p.content.slice(0, 180),
    content: p.content,
    category: p.category,
    likesCount: p.likesCount,
    commentsCount: p.commentsCount,
    isPinned: p.isPinned,
    createdAt: p.createdAt,
    authorId: p.authorId,
    authorName: p.author.name,
    authorHandle: `@${p.author.handle}`,
    authorEmoji: "👤",
    isOfficialShowcase: false,
  }));

  const showcasePosts = SHOWCASE_COMMUNITY_POSTS.filter(
    (s) => !category || category === "All" || s.category === category
  ).map((s) => ({
    ...s,
    isPinned: false,
    createdAt: new Date("2026-03-15T10:00:00Z"),
    authorId: null,
    isOfficialShowcase: true,
  }));

  return NextResponse.json({
    posts: [...formattedDbPosts, ...showcasePosts],
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(user.role, "MEMBER")) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Viewer role cannot publish community posts" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();
  const summary = String(body.summary ?? content.slice(0, 180)).trim();
  const category = String(body.category ?? "Agent Teams").trim();

  if (!title || !content) {
    return NextResponse.json(
      { error: "INVALID_POST", message: "Post title and content are required" },
      { status: 400 }
    );
  }

  const post = await prisma.communityPost.create({
    data: {
      authorId: user.id,
      title,
      summary,
      content,
      category,
    },
    include: {
      author: {
        select: { id: true, name: true, handle: true },
      },
    },
  });

  // Mark Day 7 onboarding task completed
  await prisma.onboardingTask.updateMany({
    where: { userId: user.id, dayNumber: 7 },
    data: { isCompleted: true },
  });

  await recordAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "POST_CREATED",
    targetType: "POST",
    targetId: post.id,
    metadata: { title: post.title, category: post.category },
  });

  return NextResponse.json({ post }, { status: 201 });
}
