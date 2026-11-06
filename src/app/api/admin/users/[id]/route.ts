import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { VALID_ROLES, UserRole } from "@/lib/invites";
import { recordAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getCurrentUser();
  if (!actor) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(actor.role, "ADMIN")) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Only Administrators can modify user roles or revoke accounts" },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.role && VALID_ROLES.includes(body.role as UserRole)) {
    data.role = body.role;
  }

  if (typeof body.isActive === "boolean") {
    data.isActive = body.isActive;
    data.revokedAt = body.isActive ? null : new Date();
    // Bump sessionVersion to immediately invalidate active JWT sessions
    if (!body.isActive) {
      data.sessionVersion = { increment: 1 };
    }
  }

  if (body.revokeAllSessions === true) {
    data.sessionVersion = { increment: 1 };
    await prisma.userSession.updateMany({
      where: { userId: target.id, revokedAt: null },
      data: { revokedAt: new Date(), revokedById: actor.id },
    });
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      handle: true,
      role: true,
      isActive: true,
      revokedAt: true,
      sessionVersion: true,
    },
  });

  if (body.role && body.role !== target.role) {
    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "USER_ROLE_CHANGED",
      targetType: "USER",
      targetId: target.id,
      status: "SUCCESS",
      metadata: {
        targetEmail: target.email,
        previousRole: target.role,
        newRole: updated.role,
      },
    });
  }

  if (typeof body.isActive === "boolean" && body.isActive !== target.isActive) {
    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: body.isActive ? "USER_RESTORED" : "USER_REVOKED",
      targetType: "USER",
      targetId: target.id,
      status: "SUCCESS",
      metadata: {
        targetEmail: target.email,
        sessionVersion: updated.sessionVersion,
      },
    });
  }

  if (body.revokeAllSessions === true) {
    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "SESSION_REVOKED",
      targetType: "USER",
      targetId: target.id,
      status: "SUCCESS",
      metadata: {
        targetEmail: target.email,
        scope: "ALL_SESSIONS",
        sessionVersion: updated.sessionVersion,
      },
    });
  }

  return NextResponse.json({ user: updated });
}
