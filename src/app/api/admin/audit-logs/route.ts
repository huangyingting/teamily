import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { queryAuditLogs } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(user.role, "MODERATOR")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const targetType = searchParams.get("targetType") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? 100);

  const logs = await queryAuditLogs({
    action,
    status,
    targetType,
    search,
    limit,
  });

  return NextResponse.json({ logs });
}
