# Product Requirements Document (PRD) — Teamily AI

## 1. Product Vision & Overview

**Teamily AI** is an AI-native social workspace for humans and AI agents. Unlike single-player chatbot interfaces, Teamily gives every user a **Personal AI Agent** with persistent **Living Wiki Memory**, a directory of specialized **AI Agents & Multi-Agent Teams**, **Human + Agent Group Chats**, a chip-driven **Automation Composer**, a **Discover Community Feed** where users publish and remix interactive artifacts, and a multi-format **Artifacts Studio** (Cloud Documents, Websites, Slides, Dashboards, Whiteboards).

To meet enterprise security and controlled rollout requirements, this application also enforces **Invite-Only Registration** with single-use and expiring invitation codes, **Role-Based Access Control (RBAC)**, **Instant Revocation** (for both invitations and user sessions/API keys), and **Comprehensive Audit Logging**.

---

## 2. Target Personas & RBAC Roles

| Role | Persona Description | Capabilities |
|---|---|---|
| `ADMIN` | Platform Administrator / Workspace Owner | Full access to all Teamily features plus Invitation Code generation/revocation, User Role management, Session revocation, Community Post moderation, and Audit Log inspection. |
| `MODERATOR` | Community & Workspace Moderator | Full access to Teamily features plus ability to generate standard member invitations, moderate Discover community posts, and view security events. |
| `MEMBER` | Standard Teamily Creator / Professional | Full access to Chat, Agents, Agent Teams, Automations, Discover Feed (publish, like, save, comment, remix), Memory Wiki, Artifacts Studio, Profile, Credits Center, and Settings. |
| `VIEWER` | Read-Restricted / Guest Collaborator | Can browse Discover Feed, view shared Artifacts and Wiki pages, and read conversations they are invited to, but cannot publish public posts or create new system-wide agents/automations. |

---

## 3. Core Functional Requirements

### FR-1: Public Marketing Portal & Brand Experience
- **FR-1.1 Home (`/`)**: Hero section (*"The AI-Native Social Workspace for Humans and Agents"*), interactive feature showcases (Personal AI & Living Wiki, Multi-Agent Teams, Group Chat with Friends & AI, Create & Publish Artifacts), and platform CTAs.
- **FR-1.2 Pricing (`/pricing`)**: Monthly/Annual billing toggle with 4 tiers (`Free $0`, `Plus $19.99/mo` with `$9.99/mo` student discount, `Premium $99.99/mo`, `Pro $199.99/mo`) and detailed feature comparison.
- **FR-1.3 Download (`/download`)**: Desktop (macOS Apple Silicon, macOS Intel, Windows) and Mobile (iOS App Store, Google Play) download cards and QR modal.
- **FR-1.4 About & Help Center (`/about`, `/about/help-center`, `/explore`)**: Company mission, searchable FAQ/Help Center categories, and public artifact showcase.

### FR-2: Invite-Only Authentication, RBAC, Revocation & Audit Logging
- **FR-2.1 Invite-Only Registration (`/register` & `/login`)**:
  - Users must supply a valid **Invitation Code** alongside email, name, and password to register.
  - Invitation codes support **single-use** (`maxUses = 1`) or multi-use limits, **expiration timestamps** (`expiresAt`), **optional email binding** (`boundEmail`), and **assigned RBAC role** (`ADMIN`, `MODERATOR`, `MEMBER`, `VIEWER`).
  - Attempting to register with an invalid, expired, revoked, or already-used single-use code fails with a clear error message and logs a security audit event.
- **FR-2.2 Invitation Management & Revocation (`/settings/security` & `/settings/credits-center?tab=invite`)**:
  - Admins and authorized users can create new invitation codes specifying single-use vs. multi-use, expiration window (e.g., 1 hour, 24 hours, 7 days, 30 days, custom), target role, and optional note/recipient email.
  - Any active invitation code can be immediately **revoked** (`status = REVOKED`), preventing future redemptions.
- **FR-2.3 Session & API Token Revocation**:
  - Users and Admins can view active sessions and authorized Agent API clients (`/settings/agent-access` and `/settings/security`) and revoke individual sessions or force-revoke all sessions for a user.
- **FR-2.4 Immutable Audit Logging (`/settings/security`)**:
  - Every authentication, registration, invite code creation/redemption/failure/revocation, role change, session revocation, agent creation, and permission change is recorded in `AuditLog` with actor, action, target entity, IP/user-agent metadata, status, and timestamp.
  - Admins can filter and search audit logs by action type, actor, status, and date range.

### FR-3: Human + Agent Chat & Group Collaboration (`/chat`)
- **FR-3.1 Conversation Sidebar**:
  - Search bar + 10 horizontal filter tabs (`All`, `Artifacts`, `Contacts`, `Groups`, `Agents`, `Messages`, `Files`, `Cloud Docs`, `Media`, `Links`).
  - `+` (`Create`) dropdown menu (`Create Agent`, `New Group`, `Add Contact`, `Create Artifacts`, `Create Automation`, `Create Local Agent`, `Start Video Meeting`, `Join Video Meeting`).
  - Pinned Personal Agent card, Pinned conversations (`Teamily Agent`), and chronological conversation list (Specialist Agents, Custom Agents, Direct Contacts, and Multi-Agent/Human Groups).
  - Onboarding reward banner (`Earn up to 12 CREDITS`).
- **FR-3.2 Active Chat & Rich Composer**:
  - Message stream with Markdown rendering, interactive prompt chips, message reactions, Save to Artifacts action, and tool execution status badges.
  - Composer toolbar with `+` attachment menu, **Skills Popover** (toggle among 12 skills), **Connectors Popover** (connect/toggle 11 OAuth/API apps), **Agent Mode Selector** (`Auto`, `Instant`, `Agentic`), **Enhance Prompt with Memory**, **Meeting Minutes**, and Send.
  - Slide-over **Conversation Profile Drawer** (Search messages/media, Pin conversation, Mute, Auto-translate, Clear Chat History) and **Invite to Chat Modal**.

### FR-4: Agents & Multi-Agent Teams (`/discover?tab=agents`)
- **FR-4.1 Agent Directory**: 18 domain category filters (`All`, `Content Creation`, `Customer Support`, `Data Analysis`, `Design`, `Education`, `Engineering`, `Finance`, `IT & Security`, `Investment`, `Legal`, `Life`, `Marketing`, `Operations`, `Product`, `Recruiting`, `Research`, `Sales`), search input, and instant `Chat` launch.
- **FR-4.2 Agent Teams Directory**: Curated multi-agent war rooms and guilds (`Full-Stack Delivery Guild`, `Product Launch War Room`, `SEO & AEO Content Studio`, `Security Operations Room`, `Financial Planning Room`, `Customer Health Room`, `B2B Deal Room`, etc.) with one-click group instantiation.
- **FR-4.3 Create Agent & Create Agent Team Modals**: Custom agent builder (avatar, name, description, system prompt, model, skills, connectors) and multi-agent group builder with `Members Pay` vs `Owner Pays` sponsorship toggle.

### FR-5: Automations & Interactive Prompt Compiler (`/discover?tab=agents&section=automations`)
- **FR-5.1 Tabs & Template Catalog**: `My Automations`, `Work` (12 templates), and `Life` (12 templates).
- **FR-5.2 Interactive Automation Composer Modal**:
  - Chip selectors for `INTENT` (`Research`, `Monitor`, `Create`, `Analyze`, `Plan`, `Coordinate`), `SCHEDULE` (`Run now`, `Later`, `Daily`, `Weekly`), `TEAM` (`My Personal AI`, `Add Agents`, `Add People`), and `SCOPE` (`One-shot`, `Recurring`).
  - Real-time `COMPILED PROMPT (AUTO-COMPOSED)` editor, `Save Automation`, and `Run Now` execution that posts results directly to chat/artifacts.

### FR-6: Discover Community Feed & Post Remixing (`/discover` & `/post/[id]`)
- **FR-6.1 Discover Feed**: `Following` and `Feeds` tabs, search bar, 17 category pills (`All`, `Trending`, `Webpage`, `Mini Game`, `Image`, `Music`, `Slides`, `Video`, `3D Artifact`, `Article`, `Dashboard`, `Markets`, `Mini App`, `Productivity`, `AI & Tech`), post cards with author follow, like counters, and publish modal.
- **FR-6.2 Post Detail (`/post/[id]`)**: Interactive artifact preview, creator & agent attribution, original `PROMPT` inspection, `Create My Own` (Remix into chat/studio), Like, Save to Favorites, and Comments.

### FR-7: Memory / Self-Maintaining Living Wiki (`/memory`)
- **FR-7.1 Directory & Views**: `+ New` page button, search topics, filter tabs (`All`, `Updates`, `Tags`), and 5 workspace views (`Overview`, `My Profile`, `Next Actions`, `My Artifacts`, `My Meetings`).
- **FR-7.2 Interactive Knowledge Graph & Markdown Wiki Editor**:
  - `Overview` renders an interactive node-and-edge knowledge graph of the user's Wiki topics plus recent updates and conflict alerts.
  - Selecting or creating a page opens the rich Markdown editor (`H1`, `H2`, `H3`, tags, category, version badge, `Saved to cloud` autosave, revision history, and automatic extraction from chats).

### FR-8: Artifacts & Cloud Studios (`/artifacts` & `/tiptap/[id]`)
- **FR-8.1 Artifact Library**: Left category sidebar (`All Work`, `Websites`, `Documents`, `Media`, `Messages`, `Meetings`), top filter tabs (`All`, `Created by me`, `Saved`, `Memory`), Grid/List view toggle, Search, and `+ New` dropdown (`Cloud document`, `Whiteboard`, `Upload`, `Website`).
- **FR-8.2 Interactive Cloud Document & Artifact Studio (`/tiptap/[id]`)**: Full rich-text/Markdown & HTML studio with formatting toolbar, live preview for Websites/Dashboards/Slides, star/favorite toggle, permission level indicator, and community publishing.

### FR-9: Profile, Credits Center, & Settings (`/profile/[id]`, `/settings/*`)
- **FR-9.1 User Profile & Life Goals (`/profile/[id]`, `/profile/edit`)**: Display name, `@handle`, Bio, Tags, Gender, Location, Website, Social links, and 7 private **Life Goals** (`Health & Wellness`, `Financial Goals`, `Career Growth`, `Hobbies & Interests`, `Family & Relationships`, `Productivity`, `Other`) that personalize the user's Personal AI.
- **FR-9.2 Credits Center (`/settings/credits-center`)**: `Onboarding` (7 interactive first-week tasks worth $1.00/100¢ credit each + 3-day login streak tracker), `Invite` (generate/copy referral & invite codes, redeem invite codes, view invite history), `Leaderboard` (Daily & Weekly token leagues), and `My Credits` ledger.
- **FR-9.3 Comprehensive Settings Suite (`/settings/*`)**: Quota usage ring (`5h window` & `Weekly quota`), `Create to Earn`, `Affiliate Program`, `Plan & Billing`, `Usage`, `Channels for Teamily Agent` (WeChat, iMessage, Slack, WhatsApp), `Agent API` (authorized clients & revocation), `Skill Configuration` (encrypted API keys), `App Connectors` (+ custom MCP server), `Runtimes` (Teamily Cloud, Teamily Computer, Local AI, Claude Code, Codex), `Security & Invites (Admin/RBAC & Audit Logs)`, and Light/Dark Appearance toggle.
