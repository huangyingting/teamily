import { prisma } from "./prisma";

export interface AuditLogInput {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  status?: "SUCCESS" | "FAILURE";
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function recordAuditLog(input: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        actorRole: input.actorRole ?? null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        status: input.status ?? "SUCCESS",
        metadataJson: JSON.stringify(input.metadata ?? {}),
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
    return null;
  }
}

export async function queryAuditLogs(params?: {
  action?: string;
  status?: string;
  actorId?: string;
  targetType?: string;
  search?: string;
  limit?: number;
}) {
  const where: Record<string, unknown> = {};
  if (params?.action && params.action !== "ALL") {
    where.action = params.action;
  }
  if (params?.status && params.status !== "ALL") {
    where.status = params.status;
  }
  if (params?.actorId) {
    where.actorId = params.actorId;
  }
  if (params?.targetType && params.targetType !== "ALL") {
    where.targetType = params.targetType;
  }
  if (params?.search) {
    where.OR = [
      { action: { contains: params.search } },
      { actorEmail: { contains: params.search } },
      { targetId: { contains: params.search } },
      { metadataJson: { contains: params.search } },
    ];
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: params?.limit ?? 100,
  });

  return logs.map((log) => ({
    ...log,
    metadata: safeParseJson(log.metadataJson, {}),
  }));
}

function safeParseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
