import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(user.role, "MODERATOR")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      handle: true,
      role: true,
      plan: true,
      credits: true,
      isActive: true,
      revokedAt: true,
      sessionVersion: true,
      createdAt: true,
      sessions: {
        where: { revokedAt: null },
        select: {
          id: true,
          sessionToken: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
