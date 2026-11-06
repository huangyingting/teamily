# Prioritized Engineering Task Backlog — Teamily AI

| ID | Epic | Task Title | Priority | Est. | Dependencies | Status |
|---|---|---|---|---|---|---|
| **TB-01** | Exploration | Capture public & authenticated routes, modals, scenarios, and design tokens via Playwright | P0 | 5 pts | None | Done |
| **TB-02** | Documentation | Author Exploration Coverage, ADR, PRD, Spec, Architecture/Data Model, Plan, Backlog, AC, and Feature Parity docs | P0 | 5 pts | TB-01 | In Progress |
| **TB-03** | Infrastructure | Initialize Next.js 15 App Router, TypeScript, Tailwind CSS, and `.gitignore` (excluding `.cred`) | P0 | 3 pts | TB-02 | Pending |
| **TB-04** | Database | Create Prisma SQLite (`schema.prisma`) & PostgreSQL (`schema.postgres.prisma`) schemas and run initial migration | P0 | 5 pts | TB-03 | Pending |
| **TB-05** | Security & Audit | Implement `AuditLog` service (`src/lib/audit.ts`) and RBAC/Session guard utilities | P0 | 3 pts | TB-04 | Pending |
| **TB-06** | Invites & Auth | Implement `InvitationCode` service (`src/lib/invites.ts`) with single-use, expiry, email-binding, role assignment, and revocation | P0 | 5 pts | TB-04, TB-05 | Pending |
| **TB-07** | Invites & Auth | Implement Auth.js/NextAuth Credentials provider, `/api/auth/register` (no dummy users, workspace provisioning on signup), `/login`, and `/register` | P0 | 5 pts | TB-06 | Pending |
| **TB-08** | Core Engine | Implement Teamily Platform Catalog (`src/lib/catalog.ts`) & Swarm Agent Runtime + Automation Prompt Compiler (`src/lib/agent-engine.ts`) | P0 | 5 pts | TB-04 | Pending |
| **TB-09** | Public Portal | Implement `/`, `/pricing`, `/download`, `/explore`, `/about`, `/about/help-center`, and `not-found.tsx` | P1 | 5 pts | TB-03 | Pending |
| **TB-10** | Workspace Shell | Implement Unified Navigation Shell (Desktop Left Rail, Mobile Bottom Bar, Light/Dark Theme, Quota Indicator) | P0 | 5 pts | TB-07 | Pending |
| **TB-11** | Chat Module | Implement `/chat` + API (`/api/conversations/*`) with 10 filter tabs, `+` Create menu, Skills/Connectors/AgentMode popovers, Profile Drawer, and Invite modal | P0 | 8 pts | TB-08, TB-10 | Pending |
| **TB-12** | Agents & Teams | Implement `/discover?tab=agents` + `/api/agents` with 18 categories, Agent Teams, Create Agent modal, and New Group (`Members Pay` / `Owner Pays`) modal | P0 | 5 pts | TB-08, TB-10 | Pending |
| **TB-13** | Automations | Implement `/discover?tab=agents&section=automations` + `/api/automations` with 24 Work/Life templates and interactive chip Prompt Compiler modal | P0 | 5 pts | TB-08, TB-10 | Pending |
| **TB-14** | Discover Feed | Implement `/discover` & `/post/[id]` + `/api/posts/*` with category pills, search, interactive preview, original prompt, Remix (`Create My Own`), likes, saves, comments | P1 | 5 pts | TB-10 | Pending |
| **TB-15** | Living Wiki | Implement `/memory` + `/api/wiki/*` with Knowledge Graph `Overview`, `Next Actions`, `My Profile`, `My Artifacts`, `My Meetings`, and Markdown Wiki editor | P0 | 5 pts | TB-10 | Pending |
| **TB-16** | Artifacts Studio | Implement `/artifacts` & `/tiptap/[id]` + `/api/artifacts/*` with category sidebar, `+ New` menu, and Cloud Document / Website Studio | P0 | 5 pts | TB-10 | Pending |
| **TB-17** | Profile & Credits | Implement `/profile/[id]`, `/profile/edit` (with 7 Life Goals), and `/settings/credits-center` (`Onboarding`, `Invite`, `Leaderboard`, `My Credits`) | P1 | 5 pts | TB-10 | Pending |
| **TB-18** | Settings & Admin | Implement `/settings` & all sub-pages (`subscription`, `usage`, `channels`, `agent-access`, `skill-configuration`, `connectors`, `runtimes`, `creator-center`, `affiliate`, `security` Admin Invite/RBAC/Audit console) | P0 | 8 pts | TB-05, TB-06, TB-10 | Pending |
| **TB-19** | QA & Deployment | Write unit/integration tests, Playwright E2E suite, Dockerfile, `docker-compose.yml` (PostgreSQL), verify build & live app, commit & push | P0 | 8 pts | All | Pending |
