import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createInvitationCode } from "@/lib/invites";

export async function GET() {
  const userCount = await prisma.user.count();
  return NextResponse.json({
    canBootstrap: userCount === 0,
    userCount,
  });
}

export async function POST() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    return NextResponse.json(
      {
        error: "BOOTSTRAP_LOCKED",
        message:
          "Workspace already has registered users. Ask an Administrator to generate an invitation code in Settings -> Security & Invites.",
      },
      { status: 403 }
    );
  }

  // Check if an active bootstrap admin invite already exists
  const existingActive = await prisma.invitationCode.findFirst({
    where: {
      assignedRole: "ADMIN",
      status: "ACTIVE",
      revokedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (
    existingActive &&
    existingActive.usedCount < existingActive.maxUses &&
    (!existingActive.expiresAt || existingActive.expiresAt.getTime() > Date.now())
  ) {
    return NextResponse.json({
      invite: {
        code: existingActive.code,
        assignedRole: existingActive.assignedRole,
        maxUses: existingActive.maxUses,
        expiresAt: existingActive.expiresAt,
      },
    });
  }

  const invite = await createInvitationCode({
    actorEmail: "bootstrap@system",
    actorRole: "SYSTEM",
    assignedRole: "ADMIN",
    maxUses: 1,
    expiresInHours: 24,
    note: "Initial workspace bootstrap ADMIN invitation code (single-use)",
  });

  return NextResponse.json(
    {
      invite: {
        code: invite.code,
        assignedRole: invite.assignedRole,
        maxUses: invite.maxUses,
        expiresAt: invite.expiresAt,
      },
    },
    { status: 201 }
  );
}
