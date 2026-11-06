import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { createInvitationCode, UserRole, VALID_ROLES } from "@/lib/invites";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const where = hasMinimumRole(user.role, "MODERATOR")
    ? {}
    : { createdById: user.id };

  const invites = await prisma.invitationCode.findMany({
    where,
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, handle: true, role: true },
      },
      redemptions: {
        include: {
          redeemedByUser: {
            select: { id: true, name: true, email: true, handle: true, role: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ invites });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!hasMinimumRole(user.role, "MEMBER")) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Viewer role cannot create invitation codes" },
      { status: 403 }
    );
  }

  const body = await req.json();
  let requestedRole: UserRole =
    body.assignedRole && VALID_ROLES.includes(body.assignedRole)
      ? body.assignedRole
      : "MEMBER";

  // Non-admins can only issue MEMBER or VIEWER invites
  if (user.role !== "ADMIN" && (requestedRole === "ADMIN" || requestedRole === "MODERATOR")) {
    requestedRole = "MEMBER";
  }

  const maxUses =
    user.role === "ADMIN" || user.role === "MODERATOR"
      ? Math.min(100, Math.max(1, Number(body.maxUses ?? 1)))
      : 1;

  const expiresInHours =
    body.expiresInHours !== undefined && body.expiresInHours !== null
      ? Number(body.expiresInHours)
      : 168; // 7 days default

  const invite = await createInvitationCode({
    createdById: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    assignedRole: requestedRole,
    maxUses,
    expiresInHours,
    boundEmail: body.boundEmail ? String(body.boundEmail) : null,
    note: body.note ? String(body.note) : null,
  });

  return NextResponse.json({ invite }, { status: 201 });
}
