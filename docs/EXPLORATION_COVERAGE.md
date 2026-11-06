# Teamily AI — Playwright Exploration Coverage & Reverse-Engineering Report

## 1. Executive Summary

Using Playwright with authenticated session state injected from `.cred` (`teamily.ai` cookies `sb-ztcglnfbxaupzowuocte-auth-token`, `_agentopera_auth_token`, `_artifact_auth`), we systematically explored `https://teamily.ai` across public routes, authenticated workspace routes, interactive modals/popovers, end-to-end user scenarios, error/edge states, dark mode, and responsive viewports (`1440×900` desktop, `768×1024` tablet, `390×844` mobile).

Teamily AI ("The AI-Native Social Workspace for Humans and Agents") is a hybrid multi-service web application combining:
1. **Marketing & Public Portal** (`/`, `/login`, `/pricing`, `/download`, `/explore`, `/about`, `/about/help-center`)
2. **Human + AI Agent Messaging & Group Collaboration** (`/chat`, powered by OpenIM WebAssembly SDK + AgentOpera/Swarm agent runtime)
3. **Agent & Agent Team Directory & Builder** (`/discover?tab=agents`, with 18 categories, 52 pre-configured multi-agent war rooms/guilds, and custom agent creation)
4. **Automations & Prompt Compiler** (`/discover?tab=agents&section=automations`, featuring 24 Work & Life templates and an interactive chip-based prompt compiler)
5. **Discover Community Feed & Artifact Remixing** (`/discover`, `/post/[id]`, featuring interactive Webpage, Slides, Dashboard, Document, and Mini App posts)
6. **Memory / Self-Maintaining Living Wiki** (`/memory`, featuring an interactive Knowledge Graph overview, Markdown Wiki pages, Next Actions, Meetings, and conflict detection)
7. **Artifacts & Studios** (`/artifacts`, `/tiptap/[id]`, featuring Cloud Documents, Whiteboards, Websites, Slides, and file management)
8. **Profile, Credits Center, & Settings** (`/profile/[id]`, `/profile/edit`, `/settings`, `/settings/credits-center`, `/settings/subscription`, `/settings/usage`, `/settings/channels`, `/settings/agent-access`, `/settings/skill-configuration`, `/settings/connectors`, `/settings/runtimes`, `/settings/creator-center`, `/settings/affiliate`)

---

## 2. Route & Page Coverage Matrix

| # | Route / URL | Access | Viewport(s) Tested | Status | Screenshot Evidence |
|---|---|---|---|---|---|
| 1 | `/` | Public | `1440×900`, `390×844` | Covered (100%) | `docs/screenshots/01-public-home-desktop.png`, `01-public-home-mobile.png` |
| 2 | `/login` | Public | `1440×900` | Covered (100%) | `docs/screenshots/pub-login.png` |
| 3 | `/pricing` | Public & Auth | `1440×900` | Covered (100%) | `docs/screenshots/pub-pricing.png` |
| 4 | `/download` | Public & Auth | `1440×900` | Covered (100%) | `docs/screenshots/pub-download.png` |
| 5 | `/explore` | Public | `1440×900` | Covered (100%) | `docs/screenshots/pub-explore.png` |
| 6 | `/about` | Public | `1440×900` | Covered (100%) | `docs/screenshots/pub-about.png` |
| 7 | `/about/help-center` | Public | `1440×900` | Covered (100%) | `docs/screenshots/pub-help-center.png` |
| 8 | `/chat` | Authenticated | `1440×900`, `768×1024`, `390×844`, Dark Mode | Covered (100%) | `02-auth-landing-desktop.png`, `chat-dark-mode-desktop.png`, `chat-tablet-768.png`, `chat-mobile-390.png` |
| 9 | `/discover` | Authenticated | `1440×900`, `390×844` | Covered (100%) | `auth-discover-feed.png`, `discover-mobile-390.png` |
| 10 | `/discover?tab=agents` | Authenticated | `1440×900` | Covered (100%) | `auth-discover-agents.png`, `discover-agent-teams.png` |
| 11 | `/discover?tab=agents&section=automations` | Authenticated | `1440×900` | Covered (100%) | `auth-discover-automations.png`, `automations-my-automations.png`, `automations-life.png` |
| 12 | `/post/[id]` | Public & Auth | `1440×900` | Covered (100%) | `post-detail-view.png` |
| 13 | `/memory` | Authenticated | `1440×900` | Covered (100%) | `auth-memory.png`, `memory-wiki-article.png`, `memory-next-actions.png` |
| 14 | `/artifacts` | Authenticated | `1440×900` | Covered (100%) | `auth-artifacts.png`, `scenario-artifacts-new-menu.png` |
| 15 | `/tiptap/[id]` | Authenticated | `1440×900` | Covered (100%) | `scenario-artifacts-cloud-doc.png` |
| 16 | `/profile/[id]?source=me` | Authenticated | `1440×900` | Covered (100%) | `auth-profile-me.png` |
| 17 | `/profile/edit` | Authenticated | `1440×900` | Covered (100%) | `settings-account-profile.png` |
| 18 | `/settings` | Authenticated | `1440×900` | Covered (100%) | `auth-settings.png` |
| 19 | `/settings/credits-center?tab=onboarding` | Authenticated | `1440×900` | Covered (100%) | `auth-credits-onboarding.png` |
| 20 | `/settings/credits-center?tab=invite` | Authenticated | `1440×900` | Covered (100%) | `credits-invite.png`, `scenario-invalid-invite-error.png` |
| 21 | `/settings/credits-center?tab=leaderboard` | Authenticated | `1440×900` | Covered (100%) | `credits-leaderboard.png` |
| 22 | `/settings/credits-center?tab=my-credits` | Authenticated | `1440×900` | Covered (100%) | `credits-my-credits.png` |
| 23 | `/settings/creator-center` | Authenticated | `1440×900` | Covered (100%) | `settings-create-to-earn.png` |
| 24 | `/settings/affiliate` | Authenticated | `1440×900` | Covered (100%) | `settings-affiliate-program.png` |
| 25 | `/settings/subscription` | Authenticated | `1440×900` | Covered (100%) | `settings-plan-billing.png` |
| 26 | `/settings/usage` | Authenticated | `1440×900` | Covered (100%) | `settings-usage.png` |
| 27 | `/settings/channels` | Authenticated | `1440×900` | Covered (100%) | `settings-channels-agent.png` |
| 28 | `/settings/agent-access` | Authenticated | `1440×900` | Covered (100%) | `settings-agent-api.png` |
| 29 | `/settings/skill-configuration` | Authenticated | `1440×900` | Covered (100%) | `settings-skill-config.png` |
| 30 | `/settings/connectors` | Authenticated | `1440×900` | Covered (100%) | `settings-app-connectors.png` |
| 31 | `/settings/runtimes` | Authenticated | `1440×900` | Covered (100%) | `settings-runtimes.png` |
| 32 | `/non-existent-route-404-test` | Error Route | `1440×900` | Covered (100%) | `scenario-404-error.png` |

---

## 3. Interactive Modals, Popovers & Drawers Explored

| UI Component | Trigger Location | Observed Behavior & Controls | Screenshot |
|---|---|---|---|
| **Create (`+`) Dropdown Menu** | `/chat` top-left header `+` button | Opens 8-item menu: `Create Agent`, `New Group`, `Add Contact`, `Create Artifacts`, `Create Automation`, `Create Local Agent`, `Start Video Meeting`, `Join Video Meeting` | `chat-create-menu.png` |
| **Create Anything / Create Agent Modal** | `/chat` -> `Create Agent` or `/discover?tab=agents` -> `Create My Own Agent` | Multi-mode modal (`Agent`, `Group`, `Artifact`) with Avatar picker, Agent Name, Description, System Instructions, Skills selection, and `Create Agent` action | `scenario-create-agent-modal.png`, `discover-create-agent.png` |
| **New Group / Agent Team Modal** | `/chat` -> `New Group` or Agent Teams `Create` | Tabs for `Custom Group` vs `AI Agent Team`; Group Name, Select Agents (`0/10`), Select Friends, Payment Mode (`Members Pay` vs `Owner Pays`) | `discover-create-agent.png` |
| **Skills Popover** | `/chat` composer `Skills` button | Searchable popover with `All` & `Installed` tabs; lists 12 core skills (`web-development`, `deep-research`, `multimodal-understanding`, `document-processing`, `browser-use`, `presentation-builder`, `media-generation`, `market-data`, `financial-analysis`, `social-messaging`, `memory-recall`, `task-scheduling`) + `Configure API keys` link | `chat-skills-popover.png` |
| **Connectors Popover** | `/chat` composer `Connectors` button | Searchable popover listing OAuth/API toolkits (Gmail, GitHub, Google Calendar, Notion, Google Sheets, Slack, Supabase, Outlook, Twitter/X, Google Drive, Google Docs) with `Connect` buttons | `chat-connectors-popover.png` |
| **Agent Mode Menu** | `/chat` composer `Auto` selector | Mode picker: `Auto` ("Matches the right depth to each message"), `Instant` ("Fast replies for everyday chat and quick lookups"), `Agentic` ("Plans and executes multi-step tasks with tools") | `chat-agent-mode-menu.png` |
| **Conversation Profile Drawer** | `/chat` top-right `View full profile` (`...`) | Slide-over drawer with Agent/User avatar, ID, `Start audio call`, `Start video call`, `Share Card`, `Search` (Messages, Images, Videos, Documents, Links, Audio), `Pin`, `Mute`, `Auto-translate`, `Clear Chat History` | `chat-profile-drawer.png` |
| **Invite to Conversation Dialog** | `/chat` top-right `Invite` button | Modal to add contacts or AI agents into the current conversation or create a multi-party group | `chat-invite-dialog.png` |
| **Automation Composer Modal** | `/discover?tab=agents&section=automations` template card click | Interactive prompt compiler with chip selectors for `INTENT`, `SCHEDULE`, `TEAM`, and `SCOPE`, updating `COMPILED PROMPT (AUTO-COMPOSED)` in real time | `automations-composer-modal.png`, `scenario-automation-daily-brief.png` |
| **Artifacts `+ New` Dropdown** | `/artifacts` left sidebar `+ New` button | Dropdown with `Cloud document` (Tiptap studio), `Whiteboard`, and `Upload` | `scenario-artifacts-new-menu.png` |

---

## 4. Executed Interactive Scenarios

### Scenario 1: Real-Time Agentic Chat Execution (`/chat`)
- **Action**: Selected `powlowskijoshuah's Personal Agent` (`Super Agent`, `imUid: 9000272886796423`), typed `"Give me a 3-point checklist for a product launch."` into the composer, and clicked `Send`.
- **Observed System Flow**:
  1. Message dispatched via OpenIM WebSocket/HTTP and triggered a Swarm agent run (`thread_id: 73e9dece-8aef-4a25-a8f5-27f03c63c9b7`, `agent_run_id: 22429da3-64a3-457f-b449-25bd5c63e96a`).
  2. UI displayed real-time status indicator (`Thinking...` -> tool call `complete`).
  3. Agent replied with a formatted 3-point Markdown checklist (`1. Validate readiness`, `2. Coordinate the launch`, `3. Measure and iterate`).
  4. User's 5-hour usage window updated from `100%` to `98%` (`6 credits` used out of `500` window credits).
- **Evidence**: `docs/screenshots/scenario-chat-typed.png`, `docs/screenshots/scenario-chat-sent.png`.

### Scenario 2: Custom Agent & Agent Team Creation Modal Flow (`/chat` & `/discover?tab=agents`)
- **Action**: Opened `+` menu -> `Create Agent` and `New Group` modals.
- **Observed System Flow**: Verified multi-tab creation dialog supporting custom Agent persona definition (name, description, system prompt, model, skills, MCP connectors) and AI Agent Team creation with `Members Pay` vs `Owner Pays` billing sponsorship.
- **Evidence**: `docs/screenshots/scenario-create-agent-modal.png`, `docs/screenshots/discover-create-agent.png`.

### Scenario 3: Automation Template Selection & Dynamic Prompt Compilation (`/discover?tab=agents&section=automations`)
- **Action**: Selected `Daily work brief` template under `Work`, then toggled `SCHEDULE` chip to `Weekly` and `INTENT` chip to `Analyze`.
- **Observed System Flow**: The `COMPILED PROMPT (AUTO-COMPOSED)` textarea dynamically re-rendered to incorporate the selected intent, schedule, team (`My Personal AI`), and recurring scope.
- **Evidence**: `docs/screenshots/scenario-automation-daily-brief.png`, `docs/screenshots/automations-composer-modal.png`.

### Scenario 4: Living Wiki Page Creation & Editing (`/memory`)
- **Action**: Navigated to `/memory`, clicked `+ New`, and inspected the resulting Wiki editor and API calls.
- **Observed System Flow**:
  1. Client sent `POST /swarm/api/wiki/pages` with `{"title":"Untitled page"}`.
  2. Server responded `201 Created` with `page_id: "79c53782-695e-4427-aa20-cad0dccd96a0"`, `version: 1`, `category: "Uncategorized"`, `status: "published"`.
  3. Editor opened immediately with `H1/H2/H3` formatting toolbar, tag editor, and cloud sync badge (`Saved to cloud`).
- **Evidence**: `docs/screenshots/scenario-memory-new-page.png`, `docs/screenshots/memory-wiki-article.png`.

### Scenario 5: Artifact Studio Cloud Document Creation (`/artifacts` -> `/tiptap/[id]`)
- **Action**: Navigated to `/artifacts`, clicked `+ New`, and selected `Cloud document`.
- **Observed System Flow**:
  1. Client called `POST /swarm/api/sources/import` with `{"ref":{"origin_kind":"blank","blank":{"workspace_type":"tiptap"}},"intent":"write"}`.
  2. Server created `drive_item_id: "fb431d87-1275-4075-8a19-6bb028101fdd"` and `workspace_id: "37c07b29-2058-40da-95be-d8abe8b34035"`.
  3. Browser navigated to `/tiptap/37c07b29-2058-40da-95be-d8abe8b34035` with a rich WYSIWYG document toolbar (Undo, Redo, Heading levels, Bold, Italic, Underline, Lists, Alignment, Version history, Download, Share).
- **Evidence**: `docs/screenshots/scenario-artifacts-new-menu.png`, `docs/screenshots/scenario-artifacts-cloud-doc.png`.

### Scenario 6: Edge & Error States (Invalid Invite Code Redemption & 404 Not Found)
- **Action 1**: Navigated to `/settings/credits-center?tab=invite`, entered `"INVALID99"` into `Enter invite code`, and clicked `Redeem`.
  - **Observed Behavior**: Client called `POST https://open.teamily.ai/userCenter/api/v1/client/user/verifyInviteCode` with `{"inviteCode":"INVALID99"}`; server returned `{"message":"Invalid invite code","code":"INVALID_INVITE_CODE","data":false}` and UI rendered an inline error toast/alert `"Invalid invite code"`.
- **Action 2**: Navigated to `/non-existent-route-404-test`.
  - **Observed Behavior**: Rendered custom branded 404 card: `404 — Page Not Found — The page you are looking for doesn't exist or has been moved.` with `Go Back` and `Home` CTA buttons.
- **Evidence**: `docs/screenshots/scenario-invalid-invite-error.png`, `docs/screenshots/scenario-404-error.png`.

---

## 5. Observed Backend API Catalog

Teamily's frontend communicates with three logical backend domains, which we unify in our Next.js App Router API layer:

### A. User Center, Auth, & Invites (`open.teamily.ai/userCenter/api/v1/*` & `_supabase/auth/v1/*`)
- `GET /userCenter/api/v1/client/user/getCurrentAccount` — Current user account, role, UUID, API key, email, invite status
- `GET /userCenter/api/v1/client/user/getProfile` — Profile metadata (`displayName`, `handle`, `bio`, `tags`, `gender`, `location`, `website`, `lifeGoals`)
- `GET /userCenter/api/v1/client/invite/codes` — User's available invite codes and remaining invite quota
- `GET /userCenter/api/v1/client/invite/summary` — Accepted invites, pending invites, earned credits
- `GET /userCenter/api/v1/client/invite/list` — Paginated invitation redemption history
- `POST /userCenter/api/v1/client/user/verifyInviteCode` — Verify/redeem an invitation code

### B. Subscriptions, Quotas, Onboarding Tasks & Agents (`open.teamily.ai/agentapi/*`)
- `GET /agentapi/user-subs/detail` — Active plan (`FREE`, `PLUS`, `PREMIUM`, `PRO`), 5h window percentage, weekly percentage, credit balances
- `GET /agentapi/user-subs/plan/list` — Pricing tiers and feature lists
- `GET /agentapi/user-subs/deduction/task-visibility` — 7 first-week onboarding tasks and completion status
- `GET /agentapi/user-subs/deduction/login-streak` — Consecutive login streak tracker
- `GET /agentapi/api/leaderboard/personal` — Daily and Weekly AI usage leaderboard
- `POST /agentapi/agent/im/list` & `GET /agentapi/agent/im/detail` — Built-in and custom AI agent directory metadata

### C. Swarm Runtime, Wiki, Drive Artifacts & Connectors (`teamily.ai/swarm/api/*` & `imserver.teamily.ai/im_api/*`)
- `GET /swarm/api/agents` & `POST /swarm/api/agents` — User-configured agents, system prompts, skills, MCPs
- `GET /swarm/api/thread/{threadId}/{runId}/snapshot` — Agent execution progress & tool call outputs
- `GET /swarm/api/wiki/overview` — Living Wiki knowledge graph (`nodes` and `edges`)
- `GET /swarm/api/wiki/pages` & `POST /swarm/api/wiki/pages` — Wiki pages CRUD
- `GET /swarm/api/wiki/updates` — New & conflicting wiki updates
- `GET /swarm/api/drive/items` & `POST /swarm/api/sources/import` — Artifacts & Cloud Documents CRUD
- `GET /swarm/api/composio/toolkits` & `GET /swarm/api/composio/profiles` — App connectors catalog and user connections

---

## 6. Extracted CSS Design Tokens

Extracted directly via `getComputedStyle(document.documentElement)` on `https://teamily.ai/chat`:

| Token Category | Token Name | Light Mode Value | Dark Mode Equivalent |
|---|---|---|---|
| **Brand Accent** | `--accent` / `--primary` | `#087c45` (`rgb(8, 124, 69)`) | `#10a35c` |
| **Brand Hover** | `--accent-hover` | `#066a3b` | `#0d8a4d` |
| **Brand Tonal** | `--accent-tonal` | `#ddf3e5` | `rgba(16, 163, 92, 0.18)` |
| **Backgrounds** | `--bg-main` | `#ffffff` | `#0c1310` |
| **Surfaces** | `--bg-surface` / `--card` | `#f6f8f5` | `#131d18` |
| **Subtle Surface** | `--bg-subtle` | `#eef2ef` | `#1b2822` |
| **Primary Text** | `--text-primary` | `#182b23` | `#eef5f1` |
| **Secondary Text** | `--text-secondary` | `#56665c` | `#96a89d` |
| **Muted Text** | `--text-muted` | `#84948a` | `#64756b` |
| **Borders** | `--border-main` | `#dde6e0` | `#22322a` |
| **Destructive** | `--destructive` | `#ff5260` | `#ff6b78` |
| **Typography** | `--font-sans` | `'Lato', -apple-system, BlinkMacSystemFont, sans-serif` | `'Lato', sans-serif` |
| **Radii** | `--radius-sm / md / lg / xl` | `8px / 10px / 12px / 16px` | `8px / 10px / 12px / 16px` |
