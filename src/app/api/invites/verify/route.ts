import { NextRequest, NextResponse } from "next/server";
import { validateInvitationCode } from "@/lib/invites";
import { recordAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body.code ?? body.inviteCode ?? "").toUpperCase().trim();
    const email = body.email ? String(body.email).toLowerCase().trim() : undefined;

    const result = await validateInvitationCode(code, email);
    if (!result.valid || !result.invite) {
      await recordAuditLog({
        actorEmail: email ?? null,
        action: "INVITE_VERIFY_FAILURE",
        targetType: "INVITE",
        targetId: result.invite?.id ?? (code || "EMPTY"),
        status: "FAILURE",
        metadata: {
          code,
          errorCode: result.errorCode,
          message: result.message,
        },
      });
      return NextResponse.json(
        {
          valid: false,
          error: result.errorCode ?? "INVALID_INVITE_CODE",
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: result.invite.code,
      assignedRole: result.invite.assignedRole,
      expiresAt: result.invite.expiresAt,
      boundEmail: result.invite.boundEmail,
      remainingUses: result.invite.maxUses - result.invite.usedCount,
    });
  } catch {
    return NextResponse.json(
      { valid: false, error: "INVALID_INVITE_CODE", message: "Invalid invite code" },
      { status: 400 }
    );
  }
}
