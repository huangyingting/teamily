import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  createInvitationCode,
  validateInvitationCode,
  revokeInvitationCode,
} from "@/lib/invites";
import { recordAuditLog, queryAuditLogs } from "@/lib/audit";
import { hasMinimumRole } from "@/lib/auth";
import { compileAutomationPrompt, AUTOMATION_TEMPLATES } from "@/lib/catalog";
import { generateAgentResponses } from "@/lib/agent-engine";

describe("Teamily AI Core Services (Invites, RBAC, Audit, Automation Compiler, Agent Engine)", () => {
  beforeAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.invitationRedemption.deleteMany();
    await prisma.invitationCode.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.invitationRedemption.deleteMany();
    await prisma.invitationCode.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("starts with zero dummy human user accounts in the database", async () => {
    const userCount = await prisma.user.count();
    expect(userCount).toBe(0);
  });

  it("rejects nonexistent invitation codes with INVALID_INVITE_CODE", async () => {
    const res = await validateInvitationCode("NONEXISTENT999");
    expect(res.valid).toBe(false);
    expect(res.errorCode).toBe("INVALID_INVITE_CODE");
    expect(res.message).toBe("Invalid invite code");
  });

  it("creates a single-use invitation code, validates it, and records INVITE_CREATED audit log", async () => {
    const invite = await createInvitationCode({
      actorEmail: "admin@test.local",
      actorRole: "ADMIN",
      assignedRole: "MEMBER",
      maxUses: 1,
      expiresInHours: 12,
      note: "Unit test single-use code",
    });

    expect(invite.code).toHaveLength(6);
    expect(invite.assignedRole).toBe("MEMBER");
    expect(invite.maxUses).toBe(1);
    expect(invite.status).toBe("ACTIVE");

    const check = await validateInvitationCode(invite.code);
    expect(check.valid).toBe(true);
    expect(check.invite?.id).toBe(invite.id);

    const logs = await queryAuditLogs({ action: "INVITE_CREATED" });
    expect(logs.some((l) => l.targetId === invite.id)).toBe(true);
  });

  it("enforces email binding on invitation codes when boundEmail is specified", async () => {
    const invite = await createInvitationCode({
      assignedRole: "MODERATOR",
      boundEmail: "bound@teamily.ai",
      maxUses: 1,
    });

    const wrongEmail = await validateInvitationCode(invite.code, "other@teamily.ai");
    expect(wrongEmail.valid).toBe(false);
    expect(wrongEmail.errorCode).toBe("INVITE_EMAIL_MISMATCH");

    const matchingEmail = await validateInvitationCode(invite.code, "BOUND@teamily.ai");
    expect(matchingEmail.valid).toBe(true);
  });

  it("rejects expired invitation codes and transitions status to EXPIRED", async () => {
    const expiredInvite = await createInvitationCode({
      assignedRole: "VIEWER",
      expiresInHours: -1, // already expired 1 hour ago
    });

    const check = await validateInvitationCode(expiredInvite.code);
    expect(check.valid).toBe(false);
    expect(check.errorCode).toBe("INVITE_EXPIRED");

    const updated = await prisma.invitationCode.findUnique({
      where: { id: expiredInvite.id },
    });
    expect(updated?.status).toBe("EXPIRED");
  });

  it("revokes an active invitation code and records INVITE_REVOKED audit log", async () => {
    const invite = await createInvitationCode({
      assignedRole: "MEMBER",
      maxUses: 1,
    });

    await revokeInvitationCode({
      inviteId: invite.id,
      actorId: "system-admin",
      actorEmail: "admin@teamily.ai",
      actorRole: "ADMIN",
    });

    const check = await validateInvitationCode(invite.code);
    expect(check.valid).toBe(false);
    expect(check.errorCode).toBe("INVITE_REVOKED");

    const logs = await queryAuditLogs({ action: "INVITE_REVOKED" });
    expect(logs.some((l) => l.targetId === invite.id)).toBe(true);
  });

  it("enforces RBAC role weight hierarchy accurately", () => {
    expect(hasMinimumRole("ADMIN", "ADMIN")).toBe(true);
    expect(hasMinimumRole("ADMIN", "MODERATOR")).toBe(true);
    expect(hasMinimumRole("MODERATOR", "MEMBER")).toBe(true);
    expect(hasMinimumRole("MODERATOR", "ADMIN")).toBe(false);
    expect(hasMinimumRole("MEMBER", "VIEWER")).toBe(true);
    expect(hasMinimumRole("VIEWER", "MEMBER")).toBe(false);
  });

  it("compiles Automation template chip selections deterministically", () => {
    const tpl = AUTOMATION_TEMPLATES[0];
    const compiled = compileAutomationPrompt(tpl.promptTemplate, {
      format: "structured 3-minute memo",
      topic: "global macro & tech equities",
      actionCount: "top 5",
    });

    expect(compiled).toContain("structured 3-minute memo");
    expect(compiled).toContain("global macro & tech equities");
    expect(compiled).toContain("top 5");
    expect(compiled).not.toContain("{format}");
  });

  it("generates single-agent and multi-agent swarm responses with artifact synthesis", () => {
    const groupReplies = generateAgentResponses({
      prompt: "Create an interactive launch dashboard artifact for Q3",
      mode: "Agentic",
      conversationType: "GROUP",
      agentMembers: [
        { agentId: "a1", displayName: "Steve", avatarEmoji: "🍎" },
        { agentId: "a2", displayName: "Elon", avatarEmoji: "🚀" },
      ],
      userName: "Builder",
    });

    expect(groupReplies.length).toBe(2);
    expect(groupReplies[0].senderName).toBe("Steve");
    expect(groupReplies[0].creditsUsed).toBe(12);
    expect(groupReplies[0].generatedArtifact).toBeDefined();
    expect(groupReplies[1].senderName).toBe("Elon");
  });

  it("records and filters audit log entries by action and status", async () => {
    await recordAuditLog({
      actorEmail: "security@teamily.ai",
      actorRole: "ADMIN",
      action: "SESSION_REVOKED",
      targetType: "SESSION",
      targetId: "sess-123",
      status: "SUCCESS",
      metadata: { reason: "Security drill" },
    });

    const filtered = await queryAuditLogs({
      action: "SESSION_REVOKED",
      status: "SUCCESS",
    });
    expect(filtered.length).toBeGreaterThanOrEqual(1);
    expect(filtered[0].targetId).toBe("sess-123");
  });
});
