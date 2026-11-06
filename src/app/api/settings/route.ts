import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  PLATFORM_CONNECTORS,
  PLATFORM_SKILLS,
  PRICING_TIERS,
} from "@/lib/catalog";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const [dbUser, integrations, messageCount, automationCount, artifactCount, wikiCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          handle: true,
          role: true,
          plan: true,
          credits: true,
          dailyCredits: true,
          themePreference: true,
          createdAt: true,
        },
      }),
      prisma.userIntegration.findMany({
        where: { userId: user.id },
      }),
      prisma.message.count({
        where: { conversation: { ownerId: user.id } },
      }),
      prisma.automation.count({
        where: { ownerId: user.id },
      }),
      prisma.artifact.count({
        where: { ownerId: user.id },
      }),
      prisma.wikiPage.count({
        where: { ownerId: user.id },
      }),
    ]);

  return NextResponse.json({
    user: dbUser,
    integrations,
    skillsCatalog: PLATFORM_SKILLS,
    connectorsCatalog: PLATFORM_CONNECTORS,
    pricingTiers: PRICING_TIERS,
    usage: {
      messageCount,
      automationCount,
      artifactCount,
      wikiCount,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();

  // 1. Toggle Skill or Connector integration
  if (body.integrationKey && body.integrationCategory) {
    const key = String(body.integrationKey);
    const category = String(body.integrationCategory);
    const name = String(body.integrationName ?? key);
    const isEnabled = Boolean(body.isEnabled);

    const existing = await prisma.userIntegration.findUnique({
      where: {
        userId_category_key: {
          userId: user.id,
          category,
          key,
        },
      },
    });

    const integration = existing
      ? await prisma.userIntegration.update({
          where: { id: existing.id },
          data: { isEnabled },
        })
      : await prisma.userIntegration.create({
          data: {
            userId: user.id,
            category,
            key,
            name,
            isEnabled,
          },
        });

    if (category === "CONNECTOR" && isEnabled) {
      await prisma.onboardingTask.updateMany({
        where: { userId: user.id, dayNumber: 6 },
        data: { isCompleted: true },
      });
    }

    return NextResponse.json({ integration });
  }

  // 2. Upgrade / switch subscription plan
  if (typeof body.plan === "string") {
    const tier = PRICING_TIERS.find(
      (t) => t.name.toLowerCase() === body.plan.toLowerCase() || t.id === body.plan.toLowerCase()
    );
    if (tier) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: tier.name,
          credits: tier.creditsPerMonth,
          dailyCredits: tier.dailyRefreshCredits,
        },
      });

      await recordAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "SUBSCRIPTION_CHANGED",
        targetType: "USER",
        targetId: user.id,
        metadata: { plan: tier.name, credits: tier.creditsPerMonth },
      });

      return NextResponse.json({ user: updatedUser });
    }
  }

  // 3. Claim daily credit refresh
  if (body.claimDailyRefresh === true) {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: { increment: 200 },
      },
    });
    return NextResponse.json({ user: updatedUser });
  }

  return NextResponse.json({ ok: true });
}
