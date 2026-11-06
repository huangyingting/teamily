import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getCurrentUser();
  if (!actor) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(actor.role, "ADMIN")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await context.params;
  const sessionRow = await prisma.userSession.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!sessionRow) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const updated = await prisma.userSession.update({
    where: { id: sessionRow.id },
    data: {
      revokedAt: new Date(),
      revokedById: actor.id,
    },
  });

  await recordAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: "SESSION_REVOKED",
    targetType: "SESSION",
    targetId: sessionRow.id,
    status: "SUCCESS",
    metadata: {
      targetUserId: sessionRow.userId,
      targetEmail: sessionRow.user.email,
      sessionTokenPrefix: sessionRow.sessionToken.slice(0, 8),
    },
  });

  return NextResponse.json({ session: updated });
}
