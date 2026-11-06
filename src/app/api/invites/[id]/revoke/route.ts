import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { revokeInvitationCode } from "@/lib/invites";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await context.params;
  const invite = await prisma.invitationCode.findUnique({ where: { id } });
  if (!invite) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (!hasMinimumRole(user.role, "MODERATOR") && invite.createdById !== user.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const updated = await revokeInvitationCode({
    inviteId: id,
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
  });

  return NextResponse.json({ invite: updated });
}
