import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("id") || currentUser?.id;

  if (!targetId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const profile = await prisma.user.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      email: true,
      name: true,
      handle: true,
      bio: true,
      avatarUrl: true,
      role: true,
      plan: true,
      credits: true,
      dailyCredits: true,
      themePreference: true,
      createdAt: true,
      agents: {
        where: { isSystem: false },
        orderBy: { createdAt: "desc" },
      },
      communityPosts: {
        orderBy: { createdAt: "desc" },
      },
      wikiPages: {
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, icon: true, category: true, updatedAt: true },
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim().length >= 2) {
    data.name = body.name.trim();
  }
  if (typeof body.bio === "string") {
    data.bio = body.bio.trim();
  }
  if (typeof body.avatarUrl === "string") {
    data.avatarUrl = body.avatarUrl.trim() || null;
  }
  if (typeof body.themePreference === "string") {
    data.themePreference = body.themePreference;
  }
  if (typeof body.handle === "string" && body.handle.trim()) {
    const cleanHandle = body.handle
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .trim();
    if (cleanHandle && cleanHandle !== user.handle) {
      const taken = await prisma.user.findUnique({ where: { handle: cleanHandle } });
      if (!taken) {
        data.handle = cleanHandle;
      }
    }
  }

  if (typeof body.toggleOnboardingDay === "number") {
    await prisma.onboardingTask.updateMany({
      where: { userId: user.id, dayNumber: body.toggleOnboardingDay },
      data: { isCompleted: Boolean(body.isCompleted ?? true) },
    });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      handle: true,
      bio: true,
      avatarUrl: true,
      role: true,
      plan: true,
      credits: true,
      dailyCredits: true,
      themePreference: true,
    },
  });

  return NextResponse.json({ profile: updated });
}
