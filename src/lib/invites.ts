import crypto from "crypto";
import { prisma } from "./prisma";
import { recordAuditLog } from "./audit";

export type UserRole = "ADMIN" | "MODERATOR" | "MEMBER" | "VIEWER";

export const VALID_ROLES: UserRole[] = ["ADMIN", "MODERATOR", "MEMBER", "VIEWER"];

export interface CreateInviteOptions {
  createdById?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  assignedRole?: UserRole;
  maxUses?: number;
  expiresInHours?: number | null;
  boundEmail?: string | null;
  note?: string | null;
  customCode?: string;
  ipAddress?: string | null;
}

export function generateInviteCodeString(prefix = ""): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return prefix ? `${prefix}-${code}` : code;
}

export async function createInvitationCode(options: CreateInviteOptions = {}) {
  const assignedRole: UserRole =
    options.assignedRole && VALID_ROLES.includes(options.assignedRole)
      ? options.assignedRole
      : "MEMBER";

  const maxUses = Math.max(1, options.maxUses ?? 1);
  const expiresAt =
    options.expiresInHours !== undefined && options.expiresInHours !== null
      ? new Date(Date.now() + options.expiresInHours * 3600 * 1000)
      : new Date(Date.now() + 7 * 24 * 3600 * 1000);

  let code = (options.customCode ?? generateInviteCodeString()).toUpperCase().trim();
  const existing = await prisma.invitationCode.findUnique({ where: { code } });
  if (existing) {
    code = generateInviteCodeString("TM");
  }

  const invite = await prisma.invitationCode.create({
    data: {
      code,
      createdById: options.createdById ?? null,
      assignedRole,
      maxUses,
      usedCount: 0,
      boundEmail: options.boundEmail ? options.boundEmail.toLowerCase().trim() : null,
      note: options.note ?? null,
      status: "ACTIVE",
      expiresAt,
    },
  });

  await recordAuditLog({
    actorId: options.createdById ?? null,
    actorEmail: options.actorEmail ?? "system",
    actorRole: options.actorRole ?? "SYSTEM",
    action: "INVITE_CREATED",
    targetType: "INVITE",
    targetId: invite.id,
    status: "SUCCESS",
    metadata: {
      code: invite.code,
      assignedRole: invite.assignedRole,
      maxUses: invite.maxUses,
      expiresAt: invite.expiresAt?.toISOString() ?? null,
      boundEmail: invite.boundEmail,
    },
    ipAddress: options.ipAddress ?? null,
  });

  return invite;
}

export interface ValidateInviteResult {
  valid: boolean;
  errorCode?:
    | "INVALID_INVITE_CODE"
    | "INVITE_REVOKED"
    | "INVITE_EXPIRED"
    | "INVITE_EXHAUSTED"
    | "INVITE_EMAIL_MISMATCH";
  message: string;
  invite?: {
    id: string;
    code: string;
    assignedRole: string;
    maxUses: number;
    usedCount: number;
    status: string;
    expiresAt: Date | null;
    boundEmail: string | null;
  };
}

export async function validateInvitationCode(
  rawCode: string,
  email?: string | null
): Promise<ValidateInviteResult> {
  const code = (rawCode || "").toUpperCase().trim();
  if (!code) {
    return {
      valid: false,
      errorCode: "INVALID_INVITE_CODE",
      message: "Invalid invite code",
    };
  }

  const invite = await prisma.invitationCode.findUnique({
    where: { code },
  });

  if (!invite) {
    return {
      valid: false,
      errorCode: "INVALID_INVITE_CODE",
      message: "Invalid invite code",
    };
  }

  if (invite.status === "REVOKED" || invite.revokedAt) {
    return {
      valid: false,
      errorCode: "INVITE_REVOKED",
      message: "Invite code has been revoked",
      invite,
    };
  }

  if (invite.expiresAt && invite.expiresAt.getTime() <= Date.now()) {
    if (invite.status === "ACTIVE") {
      await prisma.invitationCode.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
    }
    return {
      valid: false,
      errorCode: "INVITE_EXPIRED",
      message: "Invite code has expired",
      invite,
    };
  }

  if (invite.status === "USED" || invite.usedCount >= invite.maxUses) {
    return {
      valid: false,
      errorCode: "INVITE_EXHAUSTED",
      message: "Invite code has already been used",
      invite,
    };
  }

  if (
    invite.boundEmail &&
    email &&
    invite.boundEmail.toLowerCase().trim() !== email.toLowerCase().trim()
  ) {
    return {
      valid: false,
      errorCode: "INVITE_EMAIL_MISMATCH",
      message: "Invite code is restricted to a different email address",
      invite,
    };
  }

  return {
    valid: true,
    message: "Valid invite code",
    invite,
  };
}

export async function revokeInvitationCode(params: {
  inviteId: string;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  ipAddress?: string | null;
}) {
  const invite = await prisma.invitationCode.findUnique({
    where: { id: params.inviteId },
  });

  if (!invite) {
    throw new Error("Invitation code not found");
  }

  let validActorId: string | null = null;
  if (params.actorId) {
    const actor = await prisma.user.findUnique({
      where: { id: params.actorId },
      select: { id: true },
    });
    validActorId = actor?.id ?? null;
  }

  const updated = await prisma.invitationCode.update({
    where: { id: invite.id },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
      revokedById: validActorId,
    },
  });

  await recordAuditLog({
    actorId: validActorId,
    actorEmail: params.actorEmail ?? null,
    actorRole: params.actorRole ?? null,
    action: "INVITE_REVOKED",
    targetType: "INVITE",
    targetId: invite.id,
    status: "SUCCESS",
    metadata: {
      code: invite.code,
      previousStatus: invite.status,
    },
    ipAddress: params.ipAddress ?? null,
  });

  return updated;
}
