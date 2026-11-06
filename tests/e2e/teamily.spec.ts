import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetUsersAndInvites() {
  await prisma.auditLog.deleteMany();
  await prisma.invitationRedemption.deleteMany();
  await prisma.invitationCode.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.automation.deleteMany();
  await prisma.wikiPage.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.onboardingTask.deleteMany();
  await prisma.userIntegration.deleteMany();
  await prisma.agent.deleteMany({ where: { ownerId: { not: null } } });
  await prisma.user.deleteMany();
}

test.describe("Teamily AI Full-Stack E2E Suite", () => {
  test.beforeAll(async () => {
    await resetUsersAndInvites();
  });

  test.afterAll(async () => {
    await resetUsersAndInvites();
    await prisma.$disconnect();
  });

  test("1. Public marketing pages, pricing toggle, explore tabs, and 404 route render accurately", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Where Humans & Specialist/i })
    ).toBeVisible();

    await page.goto("/pricing");
    await expect(
      page.getByRole("heading", { name: /Scale Your Autonomous Agent Team/i })
    ).toBeVisible();
    await expect(page.getByText("Most Popular")).toBeVisible();

    await page.goto("/explore");
    await expect(
      page.getByRole("heading", {
        name: /Explore Agent Teams, Workflows & Community Showcases/i,
      })
    ).toBeVisible();

    await page.goto("/download");
    await expect(page.getByText("Teamily for macOS")).toBeVisible();

    await page.goto("/about/help-center");
    await expect(
      page.getByRole("heading", { name: /Guides, Architecture & Workspace FAQ/i })
    ).toBeVisible();

    await page.goto("/nonexistent-route-xyz");
    await expect(
      page.getByRole("heading", { name: /This page could not be found/i })
    ).toBeVisible();
  });

  test("2. Invite-only registration rejects invalid code, bootstraps first ADMIN code, provisions workspace, and enforces single-use", async ({
    page,
  }) => {
    await page.goto("/register");

    // 2a. Attempt invalid invite code
    await page.getByTestId("invite-code-input").fill("BAD999");
    await page.getByTestId("verify-invite-button").click();
    await expect(page.getByTestId("register-error")).toContainText(
      "Invalid invite code"
    );

    // 2b. Click First-Run Bootstrap Admin Invite button (when 0 users exist)
    const bootstrapBtn = page.getByTestId("bootstrap-invite-button");
    await expect(bootstrapBtn).toBeVisible();
    await bootstrapBtn.click();
    await expect(page.getByText(/Role: ADMIN/i)).toBeVisible();

    const generatedCode = await page.getByTestId("invite-code-input").inputValue();
    expect(generatedCode).not.toBe("BAD999");
    expect(generatedCode.length).toBeGreaterThanOrEqual(6);

    // 2c. Complete registration for first real user (Admin)
    await page.getByPlaceholder("Alex Chen").fill("Ada Lovelace");
    await page.getByPlaceholder("alexchen").fill("adalovelace");
    await page.getByPlaceholder("alex@company.com").fill("ada@teamily.local");
    await page.getByPlaceholder("••••••••").fill("StrongPass123!");
    await page.getByTestId("register-submit-button").click();

    // Redirects to authenticated /chat workspace with provisioned Teamily & Personal Agents
    await page.waitForURL("**/chat", { timeout: 20000 });
    await expect(page.getByText(/Welcome to/i).first()).toBeVisible();

    // 2d. Verify single-use enforcement via API: attempting to verify the consumed code fails with INVITE_EXHAUSTED
    const verifyUsedRes = await page.request.post("/api/invites/verify", {
      data: { code: generatedCode },
    });
    expect(verifyUsedRes.status()).toBe(400);
    const verifyUsedJson = await verifyUsedRes.json();
    expect(verifyUsedJson.error).toBe("INVITE_EXHAUSTED");

    // 2e. Send a message to Personal Agent in Chat
    await page
      .getByTestId("chat-composer-input")
      .fill("Generate an interactive launch dashboard artifact for our team");
    await page.getByTestId("chat-send-button").click();
    await expect(
      page.getByText(/Saved Deliverable to Artifacts/i).first()
    ).toBeVisible({ timeout: 15000 });

    // 2f. Navigate to Discover -> Agents -> Automations and customize parameter chips
    await page.goto("/discover?tab=agents&section=automations");
    await page
      .getByTestId("automation-template-auto-morning-briefing")
      .click();
    await expect(page.getByTestId("compiled-automation-prompt")).toBeVisible();
    await page.getByTestId("automation-chip-format").click();
    await page.getByTestId("save-automation-button").click();
    await expect(
      page.getByText(/Your Active Scheduled Automations/i)
    ).toBeVisible();

    // 2g. Navigate to Memory -> Living Wiki and create a new Wiki page
    await page.goto("/memory");
    await page.getByTestId("memory-new-page-button").click();
    await expect(page.getByTestId("wiki-title-input")).toBeVisible();
    await page.getByTestId("wiki-title-input").fill("Q3 Autonomous Architecture Spec");
    await page.getByTestId("wiki-save-button").click();
    await expect(page.getByText("Saved ✓")).toBeVisible();

    // 2h. Navigate to Artifacts and create a TipTap Cloud Document
    await page.goto("/artifacts");
    await page.getByTestId("artifacts-new-button").click();
    await page.getByTestId("create-cloud-document-button").click();
    await page.waitForURL("**/tiptap/**", { timeout: 15000 });
    await expect(page.getByTestId("tiptap-title-input")).toBeVisible();
    await page.getByTestId("tiptap-save-button").click();
    await expect(page.getByText("Saved ✓")).toBeVisible();

    // 2i. Navigate to Settings -> Security, Invites & Audit, issue a new invite, revoke it, and check Audit Logs
    await page.goto("/settings/security");
    await page.getByTestId("create-invite-submit").click();
    const revokeBtn = page.locator('[data-testid^="revoke-invite-"]').first();
    await expect(revokeBtn).toBeVisible();
    await revokeBtn.click();
    await expect(page.getByText("REVOKED").first()).toBeVisible();

    await page.getByTestId("security-tab-audit").click();
    await expect(
      page.getByTestId("audit-log-INVITE_REVOKED").first()
    ).toBeVisible();
  });
});
