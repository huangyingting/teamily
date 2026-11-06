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

test.describe("Teamily AI Comprehensive Full-Stack E2E Suite (100% Original Feature Parity)", () => {
  test.beforeAll(async () => {
    await resetUsersAndInvites();
  });

  test.afterAll(async () => {
    await resetUsersAndInvites();
    await prisma.$disconnect();
  });

  test("1. Public Portal: Home, Pricing Billing Toggle, Explore Tabs, Download, Help Center FAQ Search, and Custom 404", async ({
    page,
  }) => {
    // Home page
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Where Humans & Specialist/i })
    ).toBeVisible();

    // Pricing page + Billing Toggle
    await page.goto("/pricing");
    await expect(
      page.getByRole("heading", { name: /Scale Your Autonomous Agent Team/i })
    ).toBeVisible();
    await expect(page.getByText("Most Popular")).toBeVisible();
    await page.getByRole("button", { name: /Monthly Billing/i }).click();
    await expect(page.getByText("$40")).toBeVisible();

    // Public Explore page + Tabs
    await page.goto("/explore");
    await expect(
      page.getByRole("heading", {
        name: /Explore Agent Teams, Workflows & Community Showcases/i,
      })
    ).toBeVisible();
    await page.getByRole("button", { name: "Automations" }).click();
    await expect(
      page.getByText(/Daily Morning Executive Briefing/i)
    ).toBeVisible();
    await page.getByRole("button", { name: "Community Feed" }).click();
    await expect(
      page.getByText(/How I Replaced 4 Morning Newsletters with a 3-Agent Briefing Room/i)
    ).toBeVisible();

    // Download page
    await page.goto("/download");
    await expect(page.getByText("Teamily for macOS")).toBeVisible();
    await expect(page.getByText("Teamily for Windows")).toBeVisible();

    // About & Help Center FAQ search
    await page.goto("/about");
    await expect(
      page.getByRole("heading", {
        name: /From Isolated AI Chats to Compounding Human \+ AI Teams/i,
      })
    ).toBeVisible();

    await page.goto("/about/help-center");
    await expect(
      page.getByRole("heading", { name: /Guides, Architecture & Workspace FAQ/i })
    ).toBeVisible();
    await page
      .getByPlaceholder("Search guides (e.g. invite codes, automations, living wiki)...")
      .fill("Living Wiki");
    await expect(
      page.getByText(/How does the Living Wiki share memory across my agents/i)
    ).toBeVisible();

    // Custom 404 route
    await page.goto("/nonexistent-route-xyz");
    await expect(
      page.getByRole("heading", { name: /This page could not be found/i })
    ).toBeVisible();
  });

  test("2. End-to-End Authenticated Journey: Invite-Only Registration, Chat Modals/Popovers/Modes, Discover/Posts/Automations, Memory 6 Views, Artifacts/TipTap, Profile/Life Goals, Credits Center 4 Tabs, All Settings, Security RBAC/Audit, Dark Mode & Mobile", async ({
    page,
  }) => {
    // =========================================================================
    // PHASE A: Invite-Only Registration, Invalid Code Rejection & Single-Use Gate
    // =========================================================================
    await page.goto("/register");

    await page.getByTestId("invite-code-input").fill("BAD999");
    await page.getByTestId("verify-invite-button").click();
    await expect(page.getByTestId("register-error")).toContainText(
      "Invalid invite code"
    );

    const bootstrapBtn = page.getByTestId("bootstrap-invite-button");
    await expect(bootstrapBtn).toBeVisible();
    await bootstrapBtn.click();
    await expect(page.getByText(/Role: ADMIN/i)).toBeVisible();

    const generatedCode = await page.getByTestId("invite-code-input").inputValue();
    expect(generatedCode).not.toBe("BAD999");
    expect(generatedCode.length).toBeGreaterThanOrEqual(6);

    await page.getByPlaceholder("Alex Chen").fill("Ada Lovelace");
    await page.getByPlaceholder("alexchen").fill("adalovelace");
    await page.getByPlaceholder("alex@company.com").fill("ada@teamily.local");
    await page.getByPlaceholder("••••••••").fill("StrongPass123!");
    await page.getByTestId("register-submit-button").click();

    await page.waitForURL("**/chat", { timeout: 20000 });
    await expect(page.getByText(/Welcome to/i).first()).toBeVisible();

    // Single-use invite code cannot be reused
    const verifyUsedRes = await page.request.post("/api/invites/verify", {
      data: { code: generatedCode },
    });
    expect(verifyUsedRes.status()).toBe(400);
    const verifyUsedJson = await verifyUsedRes.json();
    expect(verifyUsedJson.error).toBe("INVITE_EXHAUSTED");

    // =========================================================================
    // PHASE B: Chat Workspace (/chat) — 8-Item Plus Menu, Custom Agent (Simple/Pro),
    // Multi-Agent Group, Skills & Connectors Popovers, Enhance Prompt, Invite Modal,
    // Video Meeting Modal, Conversation Filter Tabs & Profile Drawer Controls
    // =========================================================================
    // 1. Open 8-item `+` menu and verify all 8 items exist
    await page.getByTestId("chat-plus-button").click();
    await expect(page.getByTestId("chat-plus-menu")).toBeVisible();
    await expect(page.getByTestId("plus-create-agent")).toBeVisible();
    await expect(page.getByTestId("plus-new-group")).toBeVisible();
    await expect(page.getByTestId("plus-add-contact")).toBeVisible();
    await expect(page.getByTestId("plus-create-artifacts")).toBeVisible();
    await expect(page.getByTestId("plus-create-automation")).toBeVisible();
    await expect(page.getByTestId("plus-create-local-agent")).toBeVisible();
    await expect(page.getByTestId("plus-start-video-meeting")).toBeVisible();
    await expect(page.getByTestId("plus-join-video-meeting")).toBeVisible();

    // 2. Create Custom Agent (Pro Mode)
    await page.getByTestId("plus-create-agent").click();
    await expect(page.getByTestId("create-agent-modal")).toBeVisible();
    await page.getByTestId("agent-builder-tab-pro").click();
    await page.getByTestId("new-agent-name-input").fill("FinOps Strategist");
    await page.getByTestId("new-agent-title-input").fill("Cloud Economics Advisor");
    await page
      .getByTestId("new-agent-prompt-input")
      .fill("Always analyze unit economics and margin impact.");
    await page.getByTestId("create-agent-submit").click();
    await expect(page.getByTestId("create-agent-modal")).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "FinOps Strategist" })
    ).toBeVisible();

    // 3. Create Multi-Agent Group Room with Credit Sponsorship ("Owner Pays")
    await page.getByTestId("chat-plus-button").click();
    await page.getByTestId("plus-new-group").click();
    await expect(page.getByTestId("create-group-modal")).toBeVisible();
    await page.getByTestId("group-name-input").fill("Q3 Launch War Room");
    await page.getByTestId("create-group-submit").click();
    await expect(page.getByTestId("create-group-modal")).toBeHidden();
    await expect(
      page.getByRole("heading", { name: /Q3 Launch War Room/i })
    ).toBeVisible();

    // 4. Skills Popover & Connectors Popover in Chat Composer
    await page.getByTestId("chat-skills-button").click();
    await expect(page.getByTestId("chat-skills-popover")).toBeVisible();
    await page.getByTestId("skill-item-decision-matrix").click();
    await page.getByTestId("chat-skills-button").click();

    await page.getByTestId("chat-connectors-button").click();
    await expect(page.getByTestId("chat-connectors-popover")).toBeVisible();
    await page.getByTestId("connector-toggle-notion").click();
    await page.getByTestId("chat-connectors-button").click();

    // 5. Enhance Prompt with Memory + Agentic Mode + Send Message & Synthesize Artifact
    await page
      .getByTestId("chat-composer-input")
      .fill("Generate an interactive launch dashboard artifact for our team");
    await page.getByTestId("chat-enhance-prompt-button").click();
    const enhancedVal = await page.getByTestId("chat-composer-input").inputValue();
    expect(enhancedVal).toContain("Living Wiki Memory");

    await page.getByTestId("chat-mode-agentic").click();
    await page.getByTestId("chat-send-button").click();
    await expect(
      page.getByText(/Saved Deliverable to Artifacts/i).first()
    ).toBeVisible({ timeout: 15000 });

    // 6. Invite Specialist Agent to Conversation Modal
    await page.getByTestId("chat-invite-member-button").click();
    await expect(page.getByTestId("chat-invite-modal")).toBeVisible();
    await page.locator('[data-testid^="invite-agent-"]').first().click();
    await expect(page.getByTestId("chat-invite-modal")).toBeHidden();

    // 7. Right Conversation Profile Drawer Controls (Search, Mute, Translate, Share, Clear)
    await expect(page.getByTestId("chat-info-drawer")).toBeVisible();
    await page.getByTestId("drawer-search-messages").fill("dashboard");
    await page.getByTestId("drawer-search-messages").fill("");
    await page.getByTestId("drawer-mute-button").click();
    await expect(page.getByText("Muted")).toBeVisible();
    await page.getByTestId("drawer-translate-button").click();
    await expect(page.getByText("Auto-Translate ON")).toBeVisible();
    await page.getByTestId("drawer-share-card-button").click();
    await expect(page.getByText("Copied!")).toBeVisible();
    await page.getByTestId("drawer-clear-history-button").click();
    await expect(page.getByText("Chat history cleared.")).toBeVisible();

    // 8. Video Meeting Modal from `+` Menu
    await page.getByTestId("chat-plus-button").click();
    await page.getByTestId("plus-start-video-meeting").click();
    await expect(
      page.getByText("Start AI-Transcribed Video Meeting")
    ).toBeVisible();
    await page.getByTestId("meeting-modal-submit").click();
    await expect(
      page.getByText("Start AI-Transcribed Video Meeting")
    ).toBeHidden();

    // 9. Conversation Filter Tabs
    await page.getByTestId("chat-filter-group").click();
    await page.getByTestId("chat-filter-pinned").click();
    await page.getByTestId("chat-filter-all").click();

    // =========================================================================
    // PHASE C: Discover Hub (/discover) & Post Detail (/post/[id])
    // =========================================================================
    await page.goto("/discover");
    await expect(
      page.getByText(/How I Replaced 4 Morning Newsletters with a 3-Agent Briefing Room/i)
    ).toBeVisible();

    // Click into Post Detail (/post/showcase-1)
    await page.goto("/post/showcase-1");
    await expect(
      page.getByRole("heading", {
        name: /How I Replaced 4 Morning Newsletters with a 3-Agent Briefing Room/i,
      })
    ).toBeVisible();
    await page.getByTestId("post-view-source").click();
    await expect(page.getByText('"postId": "showcase-1"')).toBeVisible();
    await page.getByTestId("post-view-preview").click();
    await page.getByTestId("copy-post-prompt-button").click();
    await expect(page.getByText("Copied")).toBeVisible();
    await page.getByTestId("post-like-button").click();
    await page.getByTestId("post-save-button").click();
    await expect(page.getByText("Saved ✓")).toBeVisible();

    // Add a comment on Post Detail
    await page
      .getByTestId("post-comment-input")
      .fill("Tested this multi-agent workflow in our war room — works great!");
    await page.getByTestId("post-comment-submit").click();
    await expect(
      page.getByText("Tested this multi-agent workflow in our war room — works great!")
    ).toBeVisible();

    // Discover -> Agents -> Specialist Agents, Agent Teams & Automations Chip Compiler
    await page.goto("/discover?tab=agents");
    await expect(page.getByTestId("subtab-agents")).toBeVisible();
    await page.getByTestId("subtab-teams").click();
    await expect(page.getByText("Product Launch War Room")).toBeVisible();

    await page.getByTestId("subtab-automations").click();
    await page
      .getByTestId("automation-template-auto-morning-briefing")
      .click();
    await expect(page.getByTestId("compiled-automation-prompt")).toBeVisible();
    await page.getByTestId("automation-chip-format").click();
    await page.getByTestId("save-automation-button").click();
    await expect(
      page.getByText(/Your Active Scheduled Automations/i)
    ).toBeVisible();

    // =========================================================================
    // PHASE D: Memory & Living Wiki (/memory) — All 6 Views
    // =========================================================================
    await page.goto("/memory");
    await expect(page.getByText("Living Wiki Knowledge Graph")).toBeVisible();

    // Create & save a new Wiki page
    await page.getByTestId("memory-new-page-button").click();
    await expect(page.getByTestId("wiki-title-input")).toBeVisible();
    await page
      .getByTestId("wiki-title-input")
      .fill("Q3 Autonomous Architecture Spec");
    await page.getByTestId("wiki-save-button").click();
    await expect(page.getByText("Saved ✓")).toBeVisible();

    // Check My Profile, Next Actions, My Artifacts, and Meetings tabs in Memory
    await page.getByTestId("memory-tab-profile").click();
    await expect(
      page.getByText("Personal AI Context & Life Goals Memory")
    ).toBeVisible();

    await page.getByTestId("memory-tab-actions").click();
    await expect(
      page.getByText("Action Items & Workspace Commitments")
    ).toBeVisible();

    await page.getByTestId("memory-tab-artifacts").click();
    await expect(
      page.getByText("Memory-Indexed Deliverables & Artifacts")
    ).toBeVisible();

    await page.getByTestId("memory-tab-meetings").click();
    await page
      .getByTestId("meeting-title-input")
      .fill("Weekly Product Architecture Sync");
    await page
      .getByTestId("meeting-notes-textarea")
      .fill("Approved multi-agent swarm routing and Living Wiki sync.");
    await page.getByTestId("save-meeting-dossier-button").click();
    await expect(page.getByTestId("wiki-title-input")).toHaveValue(
      "Weekly Product Architecture Sync"
    );

    // =========================================================================
    // PHASE E: Artifacts & TipTap Cloud Document Studio (/artifacts & /tiptap/[id])
    // =========================================================================
    await page.goto("/artifacts");
    await page.getByTestId("artifacts-new-button").click();
    await expect(page.getByTestId("create-cloud-document-button")).toBeVisible();
    await expect(page.getByTestId("create-whiteboard-button")).toBeVisible();
    await expect(page.getByTestId("create-html-artifact-button")).toBeVisible();

    // Create Whiteboard Canvas first -> navigates to /tiptap/[id]
    await page.getByTestId("create-whiteboard-button").click();
    await page.waitForURL("**/tiptap/**", { timeout: 15000 });
    await expect(page.getByTestId("tiptap-title-input")).toHaveValue(
      "Architecture Whiteboard Canvas"
    );

    // Return to /artifacts, create TipTap Cloud Document and save in /tiptap/[id]
    await page.goto("/artifacts");
    await page.getByTestId("artifacts-new-button").click();
    await page.getByTestId("create-cloud-document-button").click();
    await page.waitForURL("**/tiptap/**", { timeout: 15000 });
    await expect(page.getByTestId("tiptap-title-input")).toBeVisible();
    await page.getByTestId("tiptap-save-button").click();
    await expect(page.getByText("Saved ✓")).toBeVisible();

    // =========================================================================
    // PHASE F: Profile & 7 Private Life Goals (/profile/edit & /profile/[id])
    // =========================================================================
    await page.goto("/profile/edit");
    await expect(
      page.getByText("7 Private Life Goals (Personal Agent Memory)")
    ).toBeVisible();
    await page
      .getByTestId("profile-bio-input")
      .fill("Building autonomous AI agent teams and Living Wikis.");
    await page.getByTestId("profile-save-button").click();
    await page.waitForURL("**/profile/**", { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: "Ada Lovelace" })
    ).toBeVisible();

    // =========================================================================
    // PHASE G: Credits Center 4 Tabs (/settings/credits-center) & Scenario 6 Invalid Code
    // =========================================================================
    await page.goto("/settings/credits-center");
    await page.getByTestId("claim-daily-credits-button").click();
    await expect(page.getByText("Claimed +200 Today ✓")).toBeVisible();

    // Onboarding & 3-Day Streak Tab
    await page.getByTestId("credits-tab-onboarding").click();
    await expect(
      page.getByText(/3-DAY CONSECUTIVE LOGIN STREAK/i)
    ).toBeVisible();

    // Invite & Redeem Tab (Scenario 6: Invalid Invite Code check)
    await page.getByTestId("credits-tab-invite").click();
    await page.getByTestId("credits-invite-input").fill("INVALID99");
    await page.getByTestId("credits-invite-redeem").click();
    await expect(page.getByTestId("credits-invite-error")).toContainText(
      "Invalid invite code"
    );

    // Leaderboard Tab
    await page.getByTestId("credits-tab-leaderboard").click();
    await expect(
      page.getByText("Autonomous Builder Leaderboard")
    ).toBeVisible();

    // =========================================================================
    // PHASE H: All Settings Sections (/settings/*) & Security RBAC / Audit Console
    // =========================================================================
    for (const section of [
      "/settings",
      "/settings/subscription",
      "/settings/usage",
      "/settings/channels",
      "/settings/agent-access",
      "/settings/skill-configuration",
      "/settings/connectors",
      "/settings/runtimes",
      "/settings/creator-center",
      "/settings/affiliate",
    ]) {
      await page.goto(section);
      await expect(page.locator("h1").first()).toBeVisible();
    }

    // Security, Invites & Audit Console (/settings/security)
    await page.goto("/settings/security");
    await page.getByTestId("create-invite-submit").click();
    const revokeBtn = page.locator('[data-testid^="revoke-invite-"]').first();
    await expect(revokeBtn).toBeVisible();
    await revokeBtn.click();
    await expect(page.getByText("REVOKED").first()).toBeVisible();

    await page.getByTestId("security-tab-users").click();
    await expect(page.getByText("ada@teamily.local")).toBeVisible();

    await page.getByTestId("security-tab-audit").click();
    await expect(
      page.getByTestId("audit-log-INVITE_REVOKED").first()
    ).toBeVisible();

    // =========================================================================
    // PHASE I: Dark Mode Toggle & Mobile Responsive Viewport (390x844)
    // =========================================================================
    await page.goto("/chat");
    await page.getByRole("button", { name: "Toggle theme" }).first().click();
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDark).toBe(true);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId("chat-composer-input")).toBeVisible();
  });
});
