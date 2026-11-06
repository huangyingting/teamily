import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";
import { AUTOMATION_TEMPLATES, compileAutomationPrompt } from "@/lib/catalog";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({
      automations: [],
      templates: AUTOMATION_TEMPLATES,
    });
  }

  const automations = await prisma.automation.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    automations,
    templates: AUTOMATION_TEMPLATES,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(user.role, "MEMBER")) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Viewer role cannot create automations" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const title = String(body.title ?? "Scheduled Briefing Automation").trim();
  const category = body.category === "Life" ? "Life" : "Work";
  const scheduleType = ["daily", "weekly", "monthly", "once"].includes(body.scheduleType)
    ? body.scheduleType
    : "daily";
  const scheduleTime = String(body.scheduleTime ?? "09:00").trim();
  const timezone = String(body.timezone ?? "America/Los_Angeles").trim();
  const promptTemplate = String(body.promptTemplate ?? body.compiledPrompt ?? "").trim();
  const chips: Record<string, string> =
    body.chips && typeof body.chips === "object" ? body.chips : {};

  const compiledPrompt =
    body.compiledPrompt && String(body.compiledPrompt).trim()
      ? String(body.compiledPrompt).trim()
      : compileAutomationPrompt(promptTemplate, chips);

  if (!compiledPrompt) {
    return NextResponse.json(
      { error: "INVALID_PROMPT", message: "Automation prompt cannot be empty" },
      { status: 400 }
    );
  }

  const automation = await prisma.automation.create({
    data: {
      ownerId: user.id,
      title,
      category,
      scheduleType,
      scheduleTime,
      timezone,
      promptTemplate: promptTemplate || compiledPrompt,
      chipsJson: JSON.stringify(chips),
      compiledPrompt,
      deliveryTarget: String(body.deliveryTarget ?? "Personal Agent Chat"),
      isActive: true,
    },
  });

  // Mark Day 3 onboarding task completed
  await prisma.onboardingTask.updateMany({
    where: { userId: user.id, dayNumber: 3 },
    data: { isCompleted: true },
  });

  await recordAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "AUTOMATION_CREATED",
    targetType: "AUTOMATION",
    targetId: automation.id,
    metadata: {
      title: automation.title,
      category: automation.category,
      scheduleType: automation.scheduleType,
      scheduleTime: automation.scheduleTime,
    },
  });

  return NextResponse.json({ automation }, { status: 201 });
}
