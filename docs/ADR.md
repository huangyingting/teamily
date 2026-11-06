# Architecture Decision Records (ADR)

## ADR-001: Unified Full-Stack Application on Next.js (App Router, TypeScript, Tailwind CSS)

- **Status**: Accepted
- **Context**: The original `https://teamily.ai` deployment splits its frontend and backend across a React/TanStack Start web shell, a Java `userCenter`/`agentapi` service (`open.teamily.ai`), an OpenIM WebSocket/WASM messaging server (`imserver.teamily.ai`), and a Python/Supabase Swarm backend (`teamily.ai/swarm/api`). For a self-contained, production-ready replication that is easy to deploy, test, and operate locally and in production, managing four separate runtime clusters introduces unnecessary operational complexity.
- **Decision**: Implement the entire application within a unified **Next.js (App Router, TypeScript, Tailwind CSS)** codebase. Route groups `(public)` and `(workspace)` provide the public marketing pages and the authenticated workspace shell, while Next.js Route Handlers (`/api/*`) provide RESTful and streaming endpoints backing all chat, agent execution, automations, community feed, living wiki, artifact studios, settings, invite management, and audit logs.
- **Consequences**:
  - Single deployment unit with shared TypeScript types between database, API routes, and React client components.
  - Zero cross-origin cookie/token sync issues (eliminating the refresh token race condition observed on `teamily.ai`).

---

## ADR-002: Dual-Database Strategy with Prisma ORM (SQLite for Local Dev, PostgreSQL for Production)

- **Status**: Accepted
- **Context**: The system must run out-of-the-box in local development and automated E2E tests using **SQLite** while supporting **PostgreSQL** in production deployments without code changes.
- **Decision**:
  - Use **Prisma ORM** with scalar types compatible across both SQLite and PostgreSQL (`String`, `Int`, `Float`, `Boolean`, `DateTime`, and JSON-serialized text fields or `Json` backed by standard strings where needed for cross-engine compatibility).
  - Provide `prisma/schema.prisma` configured for SQLite (`provider = "sqlite"`, `DATABASE_URL="file:./dev.db"`) for local development and testing, alongside `prisma/schema.postgres.prisma` (`provider = "postgresql"`) and automated npm scripts (`db:migrate`, `db:deploy:postgres`) plus Docker Compose configuration for production PostgreSQL deployments.
- **Consequences**:
  - Developers and CI/Playwright suites can run migrations and tests instantaneously against a local SQLite file.
  - Production environments get full relational integrity, connection pooling, and horizontal scalability on PostgreSQL.

---

## ADR-003: Auth.js / NextAuth with Strict Invite-Only Registration, RBAC Roles, and Session Revocation

- **Status**: Accepted
- **Context**: In addition to replicating Teamily AI's authentication flows (`/login` and `/register`), the system requires:
  1. **Invite-only registration** using single-use and/or expiring invitation codes.
  2. **Role-Based Access Control (RBAC)** with roles (`ADMIN`, `MODERATOR`, `MEMBER`, `VIEWER`).
  3. **Revocation** of both unused invitation codes and active user sessions / API clients.
  4. **Comprehensive Audit Logging** of all security-sensitive actions.
  5. **Zero dummy/demo user accounts**: No pre-populated fake user accounts in the database.
- **Decision**:
  - Integrate **Auth.js / NextAuth v5** (`next-auth`) with Credentials authentication (Email + Password with `bcryptjs` hashing) and database-backed session validation (`sessionVersion` + `UserSession` records) so that any session can be revoked immediately by an administrator or the user.
  - Require a valid, unrevoked, non-expired invitation code (`InvitationCode`) with `usedCount < maxUses` during registration (`/api/auth/register`).
  - Bind each `InvitationCode` to a target role (`assignedRole`, defaulting to `MEMBER`, or `ADMIN` for bootstrap codes).
  - Provide a secure bootstrap mechanism: a CLI script (`npm run invite:generate`) and a bootstrap token header/env (`BOOTSTRAP_ADMIN_SECRET`) on `/api/invites/bootstrap` that allows generating the very first single-use `ADMIN` invitation code on an empty production database without seeding dummy users.
- **Consequences**:
  - Uninvited visitors cannot create accounts; expired, revoked, or exhausted single-use codes are rejected atomically inside a Prisma transaction and recorded in the `AuditLog`.
  - Admins can generate, inspect, and revoke invitation codes, change user roles, revoke user sessions, and inspect immutable audit logs directly from `/settings/security` (and `/api/admin/*`).

---

## ADR-004: Zero Dummy User Accounts vs. Platform System Catalog Initialization

- **Status**: Accepted
- **Context**: The user explicitly requested: *"Please do not use dummy data or create demo user accounts. The goal of this project is to build a production-ready application that fully replicates the original website."* At the same time, when a real user registers on `teamily.ai`, their workspace comes equipped with Teamily's official built-in AI Agents (`Personal Agent / Super Agent`, `Teamily Agent`, `Market Research`, `Health Assistant`, `Travel Planner`, `AI Stock Assistant`, `Webpage Developer`, `Accounting Assistant`, `Finance Assistant`, `Slides Assistant`), built-in Skills catalog (12 skills), App Connectors catalog (11 toolkits), Automation templates (24 Work & Life templates), Subscription Plans (`Free`, `Plus`, `Premium`, `Pro`), and initial Welcome Wiki pages.
- **Decision**:
  - **Never seed fake/dummy human user accounts**. On fresh deployment, `User` count is `0`.
  - Initialize **Platform System Catalog** definitions (official AI Agent personas, Skills, Connectors, Automation Templates, Subscription Plan tiers) idempotently, and provision a newly registered real user's default Personal Agent conversation, 7 First-Week Onboarding tasks, and starter "Welcome to Teamily" Wiki page inside the registration transaction—matching `teamily.ai`'s exact post-signup onboarding flow.
- **Consequences**:
  - Database contains 100% real registered users and their real data, while every newly registered user immediately experiences the full Teamily AI OS workspace upon signing in.

---

## ADR-005: Deterministic + LLM-Ready Agent Runtime & Automation Compiler

- **Status**: Accepted
- **Context**: Teamily AI supports three agent execution modes (`Auto`, `Instant`, `Agentic`), domain-specialized agents, an Automation Prompt Compiler (`INTENT`, `SCHEDULE`, `TEAM`, `SCOPE`), and artifact generation (Webpages, Cloud Docs, Slides, Dashboards, Wiki updates).
- **Decision**:
  - Implement a pluggable Agent Execution Engine (`src/lib/agent-engine.ts`) that uses `OPENAI_API_KEY` / compatible LLM endpoint when configured in environment or user `/settings/skill-configuration`, and provides structured, domain-aware, multi-step agentic responses (including tool execution traces, artifact generation, and automatic Living Wiki extraction) out of the box when no external key is configured.
  - Deduct usage credits against the user's 5-hour rolling window and monthly quota on each run, updating onboarding tasks and leaderboard stats automatically.
- **Consequences**:
  - Every chat conversation, multi-agent group room, automation run, and artifact generation workflow functions end-to-end in any environment.
