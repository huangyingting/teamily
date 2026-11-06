# Teamily AI — Autonomous Multi-Agent Workspace & Living Wiki

A production-ready full-stack replication of **Teamily AI** (`https://teamily.ai`) built with **Next.js (App Router, TypeScript, Tailwind CSS v4)**, **Auth.js / NextAuth**, and **Prisma ORM** (SQLite for local development and PostgreSQL for production).

---

## Key Capabilities

1. **Invite-Only Registration & Access Governance**:
   - Single-use and multi-use invitation codes (`InvitationCode`) with cryptographic code generation, expiration timestamps (`expiresAt`), optional email binding (`boundEmail`), and assigned RBAC roles (`ADMIN`, `MODERATOR`, `MEMBER`, `VIEWER`).
   - Instant invitation revocation (`POST /api/invites/[id]/revoke`) and active user/session revocation (`POST /api/admin/sessions/[id]/revoke` & `sessionVersion` invalidation).
   - Immutable security and operational audit logging (`AuditLog`) viewable and filterable in `/settings/security`.
   - **Zero Dummy User Accounts**: Starts with `0` human `User` rows. First-run bootstrap (`npm run invite:generate` or `/register` one-click bootstrap when `userCount === 0`) issues a single-use `ADMIN` invitation code.
2. **Multi-Agent Chat & Swarm Rooms (`/chat`)**:
   - Pinned `Personal Agent` and `Teamily Agent` conversations provisioned automatically when a real user redeems an invitation code.
   - `Create Agent` modal (`Simple` & `Pro` modes) and `New Group` multi-agent room builder.
   - `Auto`, `Instant`, and `Agentic` execution modes with step traces, credit accounting, and automatic deliverable saving.
3. **Discover Hub & Automation Composer (`/discover`)**:
   - Community Feed showcase, Specialist Agents directory, 52+ Agent Teams, and Work & Life Automations.
   - Interactive **Automation Composer Modal** with clickable green inline parameter chips (`compileAutomationPrompt`), schedule cadence (`daily`, `weekly`, `monthly`, `once`), and delivery time.
4. **Living Wiki & Knowledge Graph (`/memory`)**:
   - Interactive SVG Knowledge Graph (`Overview`), full Markdown Living Wiki editor (`Wiki`), `Next Actions`, and `Meetings`.
5. **Artifacts & TipTap Cloud Document Studio (`/artifacts` & `/tiptap/[id]`)**:
   - Filterable deliverable repository (`All`, `Favorites`, `Cloud Documents`, `Code & HTML Artifacts`) and rich collaborative document editor with AI expansion.
6. **Settings, Credits Center & Admin Console (`/settings/*`)**:
   - Full coverage of `Account`, `Subscription`, `Credits Center` (with +200 daily refresh claim), `Usage`, `Security, Invites & Audit`, `Channels`, `Agent Access`, `Skill Configuration`, `Connectors`, `Runtimes`, `Creator Center`, and `Affiliate`.

---

## Engineering Documentation (`/docs`)

- [`docs/EXPLORATION_COVERAGE.md`](./docs/EXPLORATION_COVERAGE.md) — Live Playwright exploration coverage, route inventory, 6 scenarios, API catalog, and CSS tokens.
- [`docs/ADR.md`](./docs/ADR.md) — Architecture Decision Records (ADR-001 through ADR-005).
- [`docs/PRD.md`](./docs/PRD.md) — Product Requirements Document.
- [`docs/SPEC.md`](./docs/SPEC.md) — Technical & Functional Specification.
- [`docs/ARCHITECTURE_AND_DATA_MODEL.md`](./docs/ARCHITECTURE_AND_DATA_MODEL.md) — System architecture & ER data model.
- [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) — Phased implementation plan.
- [`docs/TASK_BACKLOG.md`](./docs/TASK_BACKLOG.md) — Engineering task backlog.
- [`docs/ACCEPTANCE_CRITERIA.md`](./docs/ACCEPTANCE_CRITERIA.md) — Gherkin acceptance criteria.
- [`docs/FEATURE_PARITY.md`](./docs/FEATURE_PARITY.md) — Feature parity matrix & screenshot index.

---

## Quick Start (Local SQLite Development)

```bash
npm install
npx prisma migrate dev --name init

# Optional: Generate an initial single-use ADMIN invitation code via CLI
npm run invite:generate -- --role ADMIN --max-uses 1 --expires-in-hours 24

# Start development server
npm run dev
```

## Production Deployment (PostgreSQL + Docker)

```bash
docker compose up --build -d
```

## Running Tests

```bash
# Typecheck
npm run typecheck

# Unit & Integration Tests (Vitest)
npm test

# End-to-End Browser Tests (Playwright)
npm run build
npm run test:e2e
```
