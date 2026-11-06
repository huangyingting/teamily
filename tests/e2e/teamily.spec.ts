import { test, expect, Page, BrowserContext } from "@playwright/test";
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

test.describe.serial(
  "Teamily AI Comprehensive Full-Stack E2E Suite (100% Original Website Feature Parity)",
  () => {
    let context: BrowserContext;
    let page: Page;
    let generatedCode = "";

    test.beforeAll(async ({ browser }) => {
      await resetUsersAndInvites();
      context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      page = await context.newPage();
    });

    test.afterAll(async () => {
      await context?.close();
      await resetUsersAndInvites();
      await prisma.$disconnect();
    });

    test("1. Public Portal: Landing (/), Pricing (/pricing) Billing Toggle, Download (/download), About (/about), Help Center (/about/help-center) FAQ Search & Custom 404", async () => {
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

    test("2. Public Showcase Detail (/explore & /explore/[id]), Legal Routes (/about/terms-of-service, /about/privacy-policy, /about/open-source) & Referral Shortlink (/i/[code])", async () => {
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

      // Public Showcase Detail (/explore/showcase-1)
      await page.goto("/explore/showcase-1");
      await expect(
        page.getByRole("heading", {
          name: /How I Replaced 4 Morning Newsletters with a 3-Agent Briefing Room/i,
        })
      ).toBeVisible();
      await page.getByTestId("explore-copy-prompt").click();
      await expect(page.getByText("Copied")).toBeVisible();
      await page.getByTestId("explore-like-button").click();
      await page.getByTestId("explore-save-button").click();
      await expect(page.getByText("Saved ✓")).toBeVisible();
      await page
        .getByTestId("explore-comment-input")
        .fill("Awesome public showcase workflow!");
      await page.getByTestId("explore-comment-submit").click();
      await expect(page.getByText("Awesome public showcase workflow!")).toBeVisible();

      // Legal & Open Source routes from original teamily.ai
      await page.goto("/about/terms-of-service");
      await expect(
        page.getByRole("heading", { name: "Terms of Service" })
      ).toBeVisible();

      await page.goto("/about/privacy-policy");
      await expect(
        page.getByRole("heading", { name: "Privacy Policy" })
      ).toBeVisible();

      await page.goto("/about/open-source");
      await expect(
        page.getByRole("heading", { name: "Open Source Licenses" })
      ).toBeVisible();
      await expect(page.getByText("TipTap / ProseMirror")).toBeVisible();

      // Referral invite shortlink (/i/TEAM88 -> /register?code=TEAM88)
      await page.goto("/i/TEAM88");
      await page.waitForURL("**/register?code=TEAM88");
      await expect(page.getByTestId("invite-code-input")).toHaveValue("TEAM88");
    });

    test("3. Invite-Only Registration Gate (/register), Invalid Code Rejection, Bootstrap Admin Invite, Single-Use Exhaustion & Provisioned Default Teamily Assistants", async () => {
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

      generatedCode = await page.getByTestId("invite-code-input").inputValue();
      expect(generatedCode).not.toBe("BAD999");
      expect(generatedCode.length).toBeGreaterThanOrEqual(6);

      await page.getByPlaceholder("Alex Chen").fill("Ada Lovelace");
      await page.getByPlaceholder("alexchen").fill("adalovelace");
      await page.getByPlaceholder("alex@company.com").fill("ada@teamily.local");
      await page.getByPlaceholder("••••••••").fill("StrongPass123!");
      await page.getByTestId("register-submit-button").click();

      await page.waitForURL("**/chat", { timeout: 20000 });
      await expect(page.getByText(/Welcome to/i).first()).toBeVisible();

      // Verify provisioned default Teamily assistants in sidebar (from original teamily.ai/chat)
      await expect(page.getByText("Market Research").first()).toBeVisible();
      await expect(page.getByText("Health Assistant").first()).toBeVisible();
      await expect(page.getByText("Travel Planner").first()).toBeVisible();
      await expect(page.getByText("AI Stock Assistant").first()).toBeVisible();
      await expect(page.getByText("Webpage Developer").first()).toBeVisible();
      await expect(page.getByText("Accounting Assistant").first()).toBeVisible();
      await expect(page.getByText("Finance Assistant").first()).toBeVisible();
      await expect(page.getByText("Slides Assistant").first()).toBeVisible();

      // Single-use invite code cannot be reused
      const verifyUsedRes = await page.request.post("/api/invites/verify", {
        data: { code: generatedCode },
      });
      expect(verifyUsedRes.status()).toBe(400);
      const verifyUsedJson = await verifyUsedRes.json();
      expect(verifyUsedJson.error).toBe("INVITE_EXHAUSTED");
    });

    test("4. Chat Workspace (/chat): All 8 Plus-Menu Actions, Custom Agent Builder (Simple & Pro Tabs), Multi-Agent Group ('Custom Group' vs 'AI Agent Team' & 'Owner Pays' vs 'Members Pay'), Add Contact ('Agents' & 'Users') & Filter Tabs", async () => {
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

      // 2. Create Custom Agent (test both Simple Mode & Pro Mode tabs)
      await page.getByTestId("plus-create-agent").click();
      await expect(page.getByTestId("create-agent-modal")).toBeVisible();
      await page.getByTestId("agent-builder-tab-simple").click();
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

      // 3. Create Multi-Agent Group Room (test both 'Custom Group' & 'AI Agent Team' tabs and 'Members Pay' & 'Owner Pays' modes)
      await page.getByTestId("chat-plus-button").click();
      await page.getByTestId("plus-new-group").click();
      await expect(page.getByTestId("create-group-modal")).toBeVisible();
      await page.getByTestId("group-type-tab-custom-group").click();
      await page.getByTestId("group-type-tab-ai-agent-team").click();
      await page.getByTestId("group-payment-mode-select").selectOption("Members Pay");
      await page.getByTestId("group-payment-mode-select").selectOption("Owner Pays");
      await page.getByTestId("group-name-input").fill("Q3 Launch War Room");
      await page.getByTestId("create-group-submit").click();
      await expect(page.getByTestId("create-group-modal")).toBeHidden();
      await expect(
        page.getByRole("heading", { name: /Q3 Launch War Room/i })
      ).toBeVisible();

      // 4. Add Contact Modal (test both 'Agents' and 'Users' tabs + search)
      await page.getByTestId("chat-plus-button").click();
      await page.getByTestId("plus-add-contact").click();
      await expect(page.getByTestId("add-contact-modal")).toBeVisible();
      await page.getByTestId("add-contact-tab-users").click();
      await expect(
        page.getByText("Invite Teammates via Single-Use Invitation Code")
      ).toBeVisible();
      await page.getByTestId("add-contact-tab-agents").click();
      await page.getByTestId("add-contact-search-input").fill("Market");
      await page.locator('[data-testid^="add-contact-agent-"]').first().click();
      await expect(page.getByTestId("add-contact-modal")).toBeHidden();

      // 5. Create Local Agent & Join Video Meeting modals from `+` menu
      await page.getByTestId("chat-plus-button").click();
      await page.getByTestId("plus-create-local-agent").click();
      await expect(
        page.getByText("Connect Local Desktop Agent Bridge")
      ).toBeVisible();
      await page.getByRole("button", { name: "Cancel" }).click();

      await page.getByTestId("chat-plus-button").click();
      await page.getByTestId("plus-join-video-meeting").click();
      await expect(
        page.getByRole("heading", { name: "Join Video Meeting" })
      ).toBeVisible();
      await page.getByRole("button", { name: "Cancel" }).click();

      // 6. All 4 Conversation Filter Tabs (All, Agent, Group, Pinned)
      await page.getByTestId("chat-filter-agent").click();
      await page.getByTestId("chat-filter-group").click();
      await page.getByTestId("chat-filter-pinned").click();
      await page.getByTestId("chat-filter-all").click();
    });

    test("5. Chat Composer & Right Drawer: All 3 Execution Modes (Auto/Instant/Agentic), Skills (All/Installed) & Connectors Popovers, Enhance Prompt, Multi-Agent Swarm Reply, Video Meeting Sync & Drawer Controls", async () => {
      // Skills Popover (test All & Installed tabs + toggle skill)
      await page.getByTestId("chat-skills-button").click();
      await expect(page.getByTestId("chat-skills-popover")).toBeVisible();
      await page.getByTestId("skill-item-decision-matrix").click();
      await page.getByTestId("chat-skills-popover").getByRole("button", { name: "Installed", exact: true }).click();
      await page.getByTestId("chat-skills-popover").getByRole("button", { name: "All", exact: true }).click();
      await page.getByTestId("chat-skills-button").click();

      // Connectors Popover
      await page.getByTestId("chat-connectors-button").click();
      await expect(page.getByTestId("chat-connectors-popover")).toBeVisible();
      await page.getByTestId("connector-toggle-notion").click();
      await page.getByTestId("chat-connectors-button").click();

      // Cycle all 3 Execution Modes (Auto -> Instant -> Agentic) + Enhance Prompt + Send Message
      await page.getByTestId("chat-mode-auto").click();
      await page.getByTestId("chat-mode-instant").click();
      await page.getByTestId("chat-mode-agentic").click();

      await page
        .getByTestId("chat-composer-input")
        .fill("Generate an interactive launch dashboard artifact for our team");
      await page.getByTestId("chat-enhance-prompt-button").click();
      const enhancedVal = await page.getByTestId("chat-composer-input").inputValue();
      expect(enhancedVal).toContain("Living Wiki Memory");

      await page.getByTestId("chat-send-button").click();
      await expect(
        page.getByText(/Saved Deliverable to Artifacts/i).first()
      ).toBeVisible({ timeout: 15000 });

      // Invite Specialist Agent to Conversation Modal
      await page.getByTestId("chat-invite-member-button").click();
      await expect(page.getByTestId("chat-invite-modal")).toBeVisible();
      await page.locator('[data-testid^="invite-agent-"]').first().click();
      await expect(page.getByTestId("chat-invite-modal")).toBeHidden();

      // Right Conversation Profile Drawer Controls (Search, Pin, Mute, Translate, Share, Clear)
      await expect(page.getByTestId("chat-info-drawer")).toBeVisible();
      await page.getByTestId("drawer-search-messages").fill("dashboard");
      await page.getByTestId("drawer-search-messages").fill("");
      await page.getByTestId("drawer-pin-button").click();
      await page.getByTestId("drawer-mute-button").click();
      await expect(page.getByText("Muted")).toBeVisible();
      await page.getByTestId("drawer-translate-button").click();
      await expect(page.getByText("Auto-Translate ON")).toBeVisible();
      await page.getByTestId("drawer-share-card-button").click();
      await expect(page.getByText("Copied!")).toBeVisible();
      await page.getByTestId("drawer-clear-history-button").click();
      await expect(page.getByText("Chat history cleared.")).toBeVisible();

      // Start Video Meeting Modal from `+` Menu -> Sync to Living Wiki
      await page.getByTestId("chat-plus-button").click();
      await page.getByTestId("plus-start-video-meeting").click();
      await expect(
        page.getByText("Start AI-Transcribed Video Meeting")
      ).toBeVisible();
      await page.getByTestId("meeting-modal-submit").click();
      await expect(
        page.getByText("Start AI-Transcribed Video Meeting")
      ).toBeHidden();
    });

    test("6. Discover Hub (/discover) & Showcase Post Detail (/post/[id]): Feeds/Following Toggle, All Category Filters, Publish Community Post Modal, Preview/Source Toggle, Like, Save & Comments", async () => {
      await page.goto("/discover");
      await expect(
        page.getByText(/How I Replaced 4 Morning Newsletters with a 3-Agent Briefing Room/i)
      ).toBeVisible();

      // Test Feeds vs Following source toggle and all category pills
      await page.getByTestId("discover-feed-source-following").click();
      await page.getByTestId("discover-feed-source-feeds").click();
      await page.getByTestId("discover-category-agent-teams").click();
      await page.getByTestId("discover-category-automations").click();
      await page.getByTestId("discover-category-living-wiki").click();
      await page.getByTestId("discover-category-all").click();

      // Publish new workflow post to Community Feed
      await page.getByTestId("discover-publish-post-button").click();
      await page
        .getByTestId("publish-post-title")
        .fill("Autonomous FinOps & Living Wiki Swarm Playbook");
      await page.getByTestId("publish-post-category").selectOption("Agent Teams");
      await page
        .getByTestId("publish-post-content")
        .fill("We combined FinOps Strategist and Market Research with daily Living Wiki syncs.");
      await page.getByTestId("publish-post-submit").click();
      await expect(
        page.getByText("Autonomous FinOps & Living Wiki Swarm Playbook")
      ).toBeVisible();

      // Post Detail (/post/showcase-1)
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

      await page
        .getByTestId("post-comment-input")
        .fill("Tested this multi-agent workflow in our war room — works great!");
      await page.getByTestId("post-comment-submit").click();
      await expect(
        page.getByText("Tested this multi-agent workflow in our war room — works great!")
      ).toBeVisible();
    });

    test("7. Discover Agents, Agent Teams & Automation Composer (/discover?tab=agents): All Sub-Tabs, Work/Life Filters, Parameter Chip Cycling & Run Now Trigger", async () => {
      await page.goto("/discover?tab=agents");
      await expect(page.getByTestId("subtab-agents")).toBeVisible();
      await page.getByTestId("subtab-teams").click();
      await expect(page.getByText("Product Launch War Room")).toBeVisible();

      await page.getByTestId("subtab-automations").click();
      // Test Work / Life / All automation category filter buttons
      await page.getByTestId("auto-filter-work").click();
      await page.getByTestId("auto-filter-life").click();
      await page.getByTestId("auto-filter-all").click();

      await page
        .getByTestId("automation-template-auto-morning-briefing")
        .click();
      await expect(page.getByTestId("compiled-automation-prompt")).toBeVisible();
      await page.getByTestId("automation-chip-format").click();
      await page.getByTestId("automation-chip-topic").click();
      await page.getByTestId("automation-chip-actionCount").click();
      await page.getByTestId("save-automation-button").click();
      await expect(
        page.getByText(/Your Active Scheduled Automations/i)
      ).toBeVisible();

      // Trigger "Run Now" on active automation
      await page.getByRole("button", { name: /Run Now/i }).first().click();
    });

    test("8. Memory & Living Wiki (/memory): All 7 Views Including Updates & Conflict Resolution (Keep / Replace / Merge), Knowledge Graph, Wiki CRUD, Profile, Actions, Artifacts & Meetings", async () => {
      await page.goto("/memory");
      await expect(page.getByText("Living Wiki Knowledge Graph")).toBeVisible();

      await page.getByTestId("memory-new-page-button").click();
      await expect(page.getByTestId("wiki-title-input")).toBeVisible();
      await page
        .getByTestId("wiki-title-input")
        .fill("Q3 Autonomous Architecture Spec");
      await page.getByTestId("wiki-save-button").click();
      await expect(page.getByText("Saved ✓")).toBeVisible();

      // Updates & Conflict Resolution Tab (Keep Existing, Replace with New, Merge Both)
      await page.getByTestId("memory-tab-updates").click();
      await expect(
        page.getByText("Memory Updates & Conflict Resolution")
      ).toBeVisible();
      await page.getByTestId("resolve-conflict-q3-budget-kept").click();
      await expect(page.getByTestId("conflict-status-conflict-q3-budget")).toHaveText(
        "kept"
      );
      await page.getByTestId("resolve-conflict-q3-budget-replaced").click();
      await expect(page.getByTestId("conflict-status-conflict-q3-budget")).toHaveText(
        "replaced"
      );
      await page.getByTestId("resolve-conflict-release-cadence-merged").click();
      await expect(
        page.getByTestId("conflict-status-conflict-release-cadence")
      ).toHaveText("merged");

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
    });

    test("9. Artifacts Library (/artifacts) & TipTap Cloud Document Studio (/tiptap/[id]): All 6 Categories + Favorites, Grid/List View, Upload, Whiteboard, HTML Artifact & Rich Text Editor", async () => {
      await page.goto("/artifacts");
      for (const cat of [
        "All Work",
        "Websites",
        "Documents",
        "Media",
        "Messages",
        "Meetings",
        "Favorites",
        "All Work",
      ]) {
        await page.getByRole("button", { name: cat, exact: true }).click();
      }

      // Toggle List view / Grid view and Upload
      await page.getByRole("button", { name: "List view" }).click();
      await page.getByRole("button", { name: "Grid view" }).click();
      await page.getByTestId("artifacts-upload-button").click();
      await expect(
        page.getByText("Uploaded Workspace Specification.md").first()
      ).toBeVisible();

      // Create Interactive HTML Artifact -> navigates to /tiptap/[id]
      await page.getByTestId("artifacts-new-button").click();
      await page.getByTestId("create-html-artifact-button").click();
      await page.waitForURL("**/tiptap/**", { timeout: 15000 });
      await expect(page.getByTestId("tiptap-title-input")).toHaveValue(
        "Interactive Workspace Dashboard Artifact"
      );

      // Return to /artifacts and Create Whiteboard Canvas -> navigates to /tiptap/[id]
      await page.goto("/artifacts");
      await page.getByTestId("artifacts-new-button").click();
      await expect(page.getByTestId("create-cloud-document-button")).toBeVisible();
      await expect(page.getByTestId("create-whiteboard-button")).toBeVisible();
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
    });

    test("10. User Profile (/profile/[id] & /profile/edit): Posts/Favorites/Likes Tabs, Following/Followers & 7 Private Life Goals Synced to Personal Agent Memory", async () => {
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
      await page.getByRole("button", { name: "Favorites" }).click();
      await page.getByRole("button", { name: "Likes" }).click();
      await page.getByRole("button", { name: "Posts" }).click();
    });

    test("11. Credits Center (/settings/credits-center): 4 Tabs (Balance & +200 Daily Claim, 7-Day Onboarding & 3-Day Streak, Invite Code Redemption & Builder Leaderboard)", async () => {
      await page.goto("/settings/credits-center");
      await page.getByTestId("claim-daily-credits-button").click();
      await expect(page.getByText("Claimed +200 Today ✓")).toBeVisible();

      await page.getByTestId("credits-tab-onboarding").click();
      await expect(
        page.getByText(/3-DAY CONSECUTIVE LOGIN STREAK/i)
      ).toBeVisible();

      await page.getByTestId("credits-tab-invite").click();
      await page.getByTestId("credits-invite-input").fill("INVALID99");
      await page.getByTestId("credits-invite-redeem").click();
      await expect(page.getByTestId("credits-invite-error")).toContainText(
        "Invalid invite code"
      );

      await page.getByTestId("credits-tab-leaderboard").click();
      await expect(
        page.getByText("Autonomous Builder Leaderboard")
      ).toBeVisible();
    });

    test("12. Complete Settings Suite (/settings/*), Interactive Channels/Agent API/Skill Keys/MCP Server/Runtimes/Create to Earn/Affiliate, RBAC Security & Audit Console, Dark Mode & Mobile Viewport", async () => {
      // Account Settings
      await page.goto("/settings");
      await expect(page.locator("h1").first()).toBeVisible();

      // Subscription & Usage
      await page.goto("/settings/subscription");
      await expect(page.getByRole("heading", { name: /Subscription & Plan/i })).toBeVisible();
      await page.goto("/settings/usage");
      await expect(page.getByRole("heading", { name: /Workspace Usage Analytics/i })).toBeVisible();

      // Messaging Channels (WeChat, iMessage, Slack, WhatsApp)
      await page.goto("/settings/channels");
      await expect(page.getByRole("heading", { name: "WeChat" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "iMessage" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "WhatsApp" })).toBeVisible();

      // Agent Access & Agent API
      await page.goto("/settings/agent-access");
      await expect(page.getByRole("heading", { name: "Agent Access" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Agent API" })).toBeVisible();

      // Skill Configuration & Add Encrypted API Key
      await page.goto("/settings/skill-configuration");
      await page.getByTestId("add-skill-key-button").click();
      await page.getByPlaceholder("e.g. SERPER_API_KEY").fill("SERPER_API_KEY");
      await page.getByPlaceholder("sk-...").fill("sk-live-123456");
      await page.getByRole("button", { name: "Save Encrypted Key" }).click();
      await expect(page.getByText(/SERPER_API_KEY/i).first()).toBeVisible();

      // Connectors & Add Custom MCP Server
      await page.goto("/settings/connectors");
      await page.getByTestId("add-mcp-server-button").click();
      await page.getByPlaceholder("e.g. Postgres Read-Only MCP").fill("Internal Knowledge MCP");
      await page
        .getByPlaceholder("https://mcp.internal.example/sse")
        .fill("https://mcp.teamily.local/sse");
      await page.getByRole("button", { name: "Register MCP Server" }).click();
      await expect(page.getByText(/Internal Knowledge MCP/i).first()).toBeVisible();

      // Runtimes (Teamily Cloud, Teamily Computer, Local AI Claude Code & Codex)
      await page.goto("/settings/runtimes");
      await expect(page.getByRole("heading", { name: "Teamily Cloud" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Teamily Computer" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Claude Code" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Codex" })).toBeVisible();

      // Creator Center (Create to Earn) & Affiliate Program (25% Commission)
      await page.goto("/settings/creator-center");
      await expect(page.getByRole("heading", { name: /Create to Earn/i })).toBeVisible();
      await page.goto("/settings/affiliate");
      await expect(page.getByRole("heading", { name: /Affiliate Program/i })).toBeVisible();
      await expect(page.getByTestId("affiliate-referral-link")).toBeVisible();

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

      // Dark Mode Toggle & Desktop (1440x900), Tablet (768x1024) & Mobile (390x844) Viewports
      await page.goto("/chat");
      await page.getByRole("button", { name: "Toggle theme" }).first().click();
      const isDark = await page.evaluate(() =>
        document.documentElement.classList.contains("dark")
      );
      expect(isDark).toBe(true);

      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.getByTestId("chat-composer-input")).toBeVisible();

      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.getByTestId("chat-composer-input")).toBeVisible();
    });
  }
);

