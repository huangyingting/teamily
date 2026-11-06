# Acceptance Criteria (AC) — Teamily AI

## AC-1: Zero Dummy Users & Invite-Only Registration

- **AC-1.1 (Zero Pre-Seeded User Accounts)**:
  - *Given* a freshly migrated database,
  - *When* querying `prisma.user.count()`,
  - *Then* the count MUST be `0` (no dummy or demo user accounts exist).
- **AC-1.2 (Registration Rejected Without Valid Invite Code)**:
  - *Given* an unauthenticated visitor on `/register`,
  - *When* they submit registration with a missing or non-existent invite code (e.g., `"INVALID99"`),
  - *Then* `/api/auth/register` returns `400 Bad Request` with `"Invalid invite code"`, no user is created, and an `AuditLog` entry (`action: "REGISTER_FAILED_INVALID_INVITE"`, `status: "FAILURE"`) is persisted.
- **AC-1.3 (Single-Use Invite Code Enforcement)**:
  - *Given* a single-use invitation code (`maxUses = 1`, `status = "ACTIVE"`),
  - *When* User A registers with that code,
  - *Then* User A is created with the code's `assignedRole`, the code transitions to `usedCount = 1` and `status = "USED"`, and an `AuditLog` entry (`action: "USER_REGISTERED"`) is recorded;
  - *And when* User B subsequently attempts to register with the same single-use code,
  - *Then* registration is rejected with `400 Bad Request` (`"Invite code has already been used"`).
- **AC-1.4 (Expiring & Revoked Invite Code Enforcement)**:
  - *Given* an invitation code whose `expiresAt` is in the past OR whose `status` has been set to `"REVOKED"`,
  - *When* a user attempts to register or redeem that code,
  - *Then* the request is rejected with `400 Bad Request` (`"Invite code has expired"` or `"Invite code has been revoked"`), and the failure is recorded in `AuditLog`.

---

## AC-2: RBAC Roles, Revocation & Audit Logging

- **AC-2.1 (Role-Based Access Control)**:
  - *Given* a user with role `MEMBER` or `VIEWER`,
  - *When* they request `GET /api/admin/users` or attempt to change another user's role via `PATCH /api/admin/users`,
  - *Then* the server responds with `403 Forbidden`.
  - *Given* a user with role `ADMIN`,
  - *When* they update a user's role or generate a role-scoped invitation code in `/settings/security`,
  - *Then* the role change succeeds and writes an `AuditLog` record (`action: "USER_ROLE_UPDATED"`).
- **AC-2.2 (Session & API Client Revocation)**:
  - *Given* an authenticated user session or an authorized Agent API client,
  - *When* an `ADMIN` or the account owner triggers revocation (`/api/admin/sessions/[id]/revoke` or `/settings/agent-access`),
  - *Then* the session/client is immediately marked revoked (`isRevoked = true` / `sessionVersion` incremented) and logged in `AuditLog`.
- **AC-2.3 (Audit Log Visibility & Filtering)**:
  - *Given* an `ADMIN` or `MODERATOR` on `/settings/security`,
  - *When* they inspect the Audit Log tab and filter by action or status,
  - *Then* all recorded security and workspace events are displayed with timestamp, actor, action, target, status, and metadata.

---

## AC-3: Chat, Personal Agent, Skills, Connectors & Group Creation (`/chat`)

- **AC-3.1 (Personal Agent Workspace Provisioning & Real-Time Reply)**:
  - *Given* a newly registered user on `/chat`,
  - *When* they select their `[Name]'s Personal Agent` conversation, type `"Give me a 3-point checklist for a product launch."`, and click `Send`,
  - *Then* the user message appears immediately, the Agent Engine generates a structured response, the 5-hour quota window updates, and the message persists across page reloads.
- **AC-3.2 (Composer Popovers & Mode Selector)**:
  - *Given* the `/chat` composer,
  - *When* the user clicks `Skills`, `Connectors`, or `Auto` (Agent Mode),
  - *Then* the respective interactive popover opens allowing skill toggling (12 skills), connector toggling (11 toolkits), and mode selection (`Auto`, `Instant`, `Agentic`).
- **AC-3.3 (Create Agent & New Group Modals)**:
  - *Given* the `+` menu in `/chat` or `Create My Own Agent` in `/discover?tab=agents`,
  - *When* the user creates a custom AI Agent or an AI Agent Team group (selecting `Members Pay` or `Owner Pays`),
  - *Then* the new agent/group appears in the `/chat` sidebar and can immediately exchange messages.

---

## AC-4: Automations & Prompt Compiler (`/discover?tab=agents&section=automations`)

- **AC-4.1 (Work & Life Templates + Dynamic Prompt Compilation)**:
  - *Given* the Automations view (`/discover?tab=agents&section=automations`),
  - *When* the user clicks `Daily work brief` (or any of the 24 Work/Life templates),
  - *Then* the Automation Composer modal opens showing interactive chips for `INTENT`, `SCHEDULE`, `TEAM`, and `SCOPE`;
  - *And when* the user toggles chips (e.g., `Analyze` + `Weekly`),
  - *Then* `COMPILED PROMPT (AUTO-COMPOSED)` updates immediately and clicking `Run Now` or `Save Automation` persists and executes the automation.

---

## AC-5: Discover Feed, Living Wiki Memory & Artifacts Studio

- **AC-5.1 (Discover Feed & Post Detail `/discover`, `/post/[id]`)**:
  - *Given* `/discover`,
  - *When* filtering by category pills (`Webpage`, `Slides`, `Dashboard`, etc.), liking a post, or opening `/post/[id]` and clicking `Create My Own`,
  - *Then* the post detail displays the interactive preview and original prompt, and remixing opens a new workspace artifact/chat.
- **AC-5.2 (Living Wiki Memory `/memory`)**:
  - *Given* `/memory`,
  - *When* viewing `Overview` (Knowledge Graph) or clicking `+ New` to create and edit a Wiki page with tags and Markdown headings,
  - *Then* the new page is saved (`POST /api/wiki`, `PATCH /api/wiki/[id]`), displays `Saved to cloud`, and appears as a node in the Knowledge Graph.
- **AC-5.3 (Artifacts & Cloud Document Studio `/artifacts`, `/tiptap/[id]`)**:
  - *Given* `/artifacts`,
  - *When* clicking `+ New` -> `Cloud document`,
  - *Then* a new artifact is created and opens in `/tiptap/[id]` with full rich-text editing, autosave, and star/favorite support.

---

## AC-6: Profile, Credits Center, Settings & Responsive Design

- **AC-6.1 (Profile & Life Goals `/profile/[id]`, `/profile/edit`)**:
  - *Given* `/profile/edit`,
  - *When* the user updates their `@handle`, bio, and 7 Life Goals and clicks `Save`,
  - *Then* the profile updates persist and complete the `Complete Your Profile, Including Life Goals` onboarding task (+100¢ credit).
- **AC-6.2 (Responsive & Dark Mode Parity)**:
  - *Given* desktop (`1440×900`), tablet (`768×1024`), and mobile (`390×844`) viewports,
  - *When* navigating the workspace and toggling Light/Dark appearance,
  - *Then* desktop shows the left icon rail, mobile shows the 5-tab bottom bar (`Chat`, `Agents`, `Discover`, `Memory`, `Artifacts`), and CSS custom property tokens switch cleanly between light and dark palettes.
