# Implementation Plan — Teamily AI

## 1. Guiding Principles & Constraints

1. **Zero Dummy / Demo User Accounts**:
   - The database starts with `0` human user accounts.
   - No fake user accounts are seeded in migrations or seed scripts.
   - Official platform capability catalogs (Teamily's built-in AI Agent personas, Skills definitions, Connector definitions, Automation templates, and Subscription Plan tiers) are loaded from deterministic catalog modules, and a newly registered real user has their personal workspace provisioned automatically upon registration.
2. **Strict Invite-Only Registration, RBAC, Revocation & Audit Logging**:
   - Registration requires a valid `InvitationCode`.
   - Supports single-use (`maxUses = 1`) and multi-use codes, expiration timestamps (`expiresAt`), email binding, role assignment (`ADMIN`, `MODERATOR`, `MEMBER`, `VIEWER`), and instant revocation (`REVOKED`).
   - Every security and workspace event is written to the immutable `AuditLog` table.
3. **Dual Database Compatibility**:
   - Local development and automated tests run against SQLite (`prisma/schema.prisma`, `file:./dev.db`).
   - Production configuration (`prisma/schema.postgres.prisma`, `Dockerfile`, `docker-compose.yml`) targets PostgreSQL (`postgresql://...`).

---

## 2. Phased Execution Roadmap

### Phase 1: Project Scaffolding & Dual-DB Prisma Schema
- Initialize Next.js 15+ (App Router, TypeScript, Tailwind CSS) at `/data/teamily`.
- Configure `.gitignore` to strictly exclude `.cred`, `.env.local`, `*.db`, `node_modules`, and `.next`.
- Author `prisma/schema.prisma` (SQLite) and `prisma/schema.postgres.prisma` (PostgreSQL) with all 13 models.
- Run initial Prisma migration (`npx prisma migrate dev --name init`) and generate Prisma Client.

### Phase 2: Auth.js / NextAuth, Invite-Only Registration, RBAC, Revocation & Audit Service
- Implement `src/lib/audit.ts` for structured audit logging.
- Implement `src/lib/invites.ts` for invite code generation, single-use/expiration validation, atomic redemption, and revocation.
- Implement `src/lib/auth.ts` with Auth.js / NextAuth Credentials provider, `sessionVersion` verification, and RBAC helper guards (`requireAuth`, `requireRole`).
- Build CLI invite generator (`scripts/generate-invite.ts`) and `/api/invites/bootstrap`, `/api/invites`, `/api/invites/verify`, `/api/invites/[id]/revoke`, `/api/auth/register`, `/api/admin/users`, `/api/admin/sessions/[id]/revoke`, and `/api/admin/audit-logs`.

### Phase 3: Platform Catalogs & Agent Runtime Engine
- Create `src/lib/catalog.ts` containing Teamily's exact observed catalogs:
  - 10 core conversational AI Agents (`Super Agent / Personal Agent`, `Teamily Agent`, `Market Research`, `Health Assistant`, `Travel Planner`, `AI Stock Assistant`, `Webpage Developer`, `Accounting Assistant`, `Finance Assistant`, `Slides Assistant`) + 24 Discover specialist agents across 18 categories.
  - 16 curated Multi-Agent Teams (`Full-Stack Delivery Guild`, `Product Launch War Room`, `SEO & AEO Content Studio`, `Security Operations Room`, `Financial Planning Room`, `Customer Health Room`, `B2B Deal Room`, etc.).
  - 12 built-in Skills and 11 Composio App Connectors.
  - 24 Automation Templates (12 `Work` + 12 `Life`) and the dynamic Prompt Compiler (`compileAutomationPrompt`).
  - 4 Subscription Plans (`Free $0`, `Plus $19.99`, `Premium $99.99`, `Pro $199.99`) and 7 First-Week Onboarding Tasks.
- Create `src/lib/agent-engine.ts` for `Auto`, `Instant`, and `Agentic` execution, automatic artifact creation, and Living Wiki memory synthesis.

### Phase 4: Public Marketing Portal & Auth Pages
- Implement `/` (Public Home), `/pricing`, `/download`, `/about`, `/about/help-center`, `/explore`, `/login`, `/register` (with Invite Code validation + first-admin bootstrap helper when `0` users exist), and custom `not-found.tsx` (`404`).

### Phase 5: Unified Authenticated Workspace Shell & Core Modules
- Implement the responsive Workspace Shell (`src/components/WorkspaceShell.tsx`) with Desktop Left Rail, Tablet collapsible rail, Mobile Bottom Tab Bar, and Light/Dark theme persistence.
- Implement `/chat` (Conversation list, 10 filter tabs, `+` Create menu, Onboarding banner, Message stream, Rich Composer with Skills/Connectors/Agent Mode popovers, Profile Drawer, Invite Modal, New Group / Create Agent Modal).
- Implement `/discover` (Community Feed with category pills, search, Following/Feeds tabs, Publish Modal) and `/post/[id]` (Interactive Artifact Preview, Original Prompt, Remix / Create My Own, Likes, Saves, Comments).
- Implement `/discover?tab=agents` (Agents & Agent Teams directory + Create Agent / Team modal) and `/discover?tab=agents&section=automations` (My Automations, Work & Life templates + interactive Automation Composer modal).
- Implement `/memory` (Living Wiki with Knowledge Graph Overview, Next Actions, My Profile, My Artifacts, My Meetings, `+ New` page creation, Markdown editor, conflict resolution).
- Implement `/artifacts` & `/tiptap/[id]` (Drive library, `+ New` dropdown, Cloud Document & Website Studio).
- Implement `/profile/[id]`, `/profile/edit`, `/settings`, `/settings/credits-center` (`Onboarding`, `Invite`, `Leaderboard`, `My Credits`), and all `/settings/*` sub-routes including `/settings/security` (Admin/RBAC Invite Management, Session Revocation, and Audit Logs).

### Phase 6: Automated Testing, Production Deployment Config & Live Verification
- Write unit and integration tests (`vitest`) covering invite code single-use/expiration/revocation, RBAC enforcement, audit logging, automation prompt compiler, and agent engine.
- Write Playwright E2E tests (`tests/e2e/teamily.spec.ts`) testing public pages, bootstrap invite code generation, invite-only registration, invalid/revoked/used invite rejection, chat with Personal Agent, automation composer, Living Wiki page creation, Cloud Document creation, dark mode, mobile layout, and audit log verification.
- Create `Dockerfile`, `docker-compose.yml` (Next.js + PostgreSQL 16), and `.env.example`.
- Run lint, typecheck, build, unit tests, and Playwright E2E tests, then commit and push to the remote repository.
