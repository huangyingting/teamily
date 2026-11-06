import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { validateInvitationCode } from "@/lib/invites";
import { ensureSystemAgents, provisionUserWorkspace } from "@/lib/workspace-provisioner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = String(body.inviteCode ?? body.code ?? "").toUpperCase().trim();
    const email = String(body.email ?? "").toLowerCase().trim();
    const name = String(body.name ?? "").trim();
    const password = String(body.password ?? "");
    let handle = String(body.handle ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .trim();

    if (!rawCode) {
      await recordAuditLog({
        actorEmail: email || null,
        action: "INVITE_REDEEM_FAILURE",
        targetType: "INVITE",
        status: "FAILURE",
        metadata: { reason: "MISSING_INVITE_CODE" },
      });
      return NextResponse.json(
        { error: "INVALID_INVITE_CODE", message: "Invalid invite code" },
        { status: 400 }
      );
    }

    const validation = await validateInvitationCode(rawCode, email);
    if (!validation.valid || !validation.invite) {
      await recordAuditLog({
        actorEmail: email || null,
        action: "INVITE_REDEEM_FAILURE",
        targetType: "INVITE",
        targetId: validation.invite?.id ?? rawCode,
        status: "FAILURE",
        metadata: {
          code: rawCode,
          errorCode: validation.errorCode,
          message: validation.message,
        },
      });
      return NextResponse.json(
        {
          error: validation.errorCode ?? "INVALID_INVITE_CODE",
          message: validation.message,
        },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "INVALID_EMAIL", message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "INVALID_NAME", message: "Please enter your display name (at least 2 characters)" },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "WEAK_PASSWORD", message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "EMAIL_TAKEN", message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    if (!handle) {
      const baseHandle = email.split("@")[0].replace(/[^a-z0-9_]/g, "") || "member";
      handle = `${baseHandle}_${Math.floor(100 + Math.random() * 900)}`;
    } else {
      const existingHandle = await prisma.user.findUnique({ where: { handle } });
      if (existingHandle) {
        handle = `${handle}_${Math.floor(100 + Math.random() * 900)}`;
      }
    }

    await ensureSystemAgents();
    const passwordHash = await bcrypt.hash(password, 10);

    // Atomic redemption + user creation + workspace provisioning
    const result = await prisma.$transaction(async (tx) => {
      const freshInvite = await tx.invitationCode.findUnique({
        where: { id: validation.invite!.id },
      });

      if (
        !freshInvite ||
        freshInvite.status !== "ACTIVE" ||
        freshInvite.revokedAt ||
        freshInvite.usedCount >= freshInvite.maxUses ||
        (freshInvite.expiresAt && freshInvite.expiresAt.getTime() <= Date.now())
      ) {
        throw new Error("INVITE_RACE_REJECTED");
      }

      const newUsedCount = freshInvite.usedCount + 1;
      const newStatus = newUsedCount >= freshInvite.maxUses ? "USED" : "ACTIVE";

      await tx.invitationCode.update({
        where: { id: freshInvite.id },
        data: {
          usedCount: newUsedCount,
          status: newStatus,
        },
      });

      const createdUser = await tx.user.create({
        data: {
          email,
          name,
          handle,
          passwordHash,
          role: freshInvite.assignedRole,
          plan: freshInvite.assignedRole === "ADMIN" ? "Pro" : "Free",
          credits: freshInvite.assignedRole === "ADMIN" ? 6000 : 500,
          dailyCredits: 200,
          bio: `${name} on Teamily AI — building with autonomous specialist agents & Living Wiki.`,
          invitedByCodeId: freshInvite.id,
        },
      });

      await tx.invitationRedemption.create({
        data: {
          invitationCodeId: freshInvite.id,
          redeemedByUserId: createdUser.id,
        },
      });

      await provisionUserWorkspace(tx, {
        id: createdUser.id,
        name: createdUser.name,
        handle: createdUser.handle,
        email: createdUser.email,
      });

      return { user: createdUser, invite: freshInvite, newStatus };
    });

    await recordAuditLog({
      actorId: result.user.id,
      actorEmail: result.user.email,
      actorRole: result.user.role,
      action: "INVITE_REDEEM_SUCCESS",
      targetType: "INVITE",
      targetId: result.invite.id,
      status: "SUCCESS",
      metadata: {
        code: result.invite.code,
        assignedRole: result.user.role,
        inviteStatusAfter: result.newStatus,
      },
    });

    await recordAuditLog({
      actorId: result.user.id,
      actorEmail: result.user.email,
      actorRole: result.user.role,
      action: "AUTH_REGISTER_SUCCESS",
      targetType: "USER",
      targetId: result.user.id,
      status: "SUCCESS",
      metadata: {
        handle: result.user.handle,
        role: result.user.role,
        inviteCode: result.invite.code,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          handle: result.user.handle,
          role: result.user.role,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    if (message === "INVITE_RACE_REJECTED") {
      return NextResponse.json(
        { error: "INVITE_EXHAUSTED", message: "Invite code has already been used" },
        { status: 400 }
      );
    }
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "REGISTRATION_FAILED", message },
      { status: 500 }
    );
  }
}
