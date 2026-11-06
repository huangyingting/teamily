# Technical Specification (SPEC) — Teamily AI

## 1. System Stack & Runtime Requirements

- **Framework**: Next.js 15+ (App Router, React 19, TypeScript 5)
- **Styling**: Tailwind CSS + CSS Custom Properties matching `teamily.ai`'s exact light and dark mode token palette (`#087c45` primary green, `#f6f8f5` surface, `Lato` font family)
- **Authentication & Authorization**: Auth.js / NextAuth v5 (`next-auth`) with Credentials provider, database session validation, RBAC role guards (`ADMIN`, `MODERATOR`, `MEMBER`, `VIEWER`), and invite-only registration
- **Database & ORM**:
  - Local Development & Testing: **SQLite** (`prisma/schema.prisma`, `file:./dev.db`)
  - Production: **PostgreSQL** (`prisma/schema.postgres.prisma`, `postgresql://...`)
- **Icons**: `lucide-react`

---

## 2. Invitation Code, Registration & RBAC State Machine

### 2.1 Invitation Code Lifecycle (`InvitationCode`)
1. **Creation**:
   - Created by an authenticated `ADMIN` or `MODERATOR` (or every registered user's personal referral invite quota, or via the CLI/bootstrap endpoint when 0 users exist).
   - Attributes:
     - `code`: Unique 6–12 character uppercase alphanumeric string (e.g., `K7U9Z6` or `TEAM-XXXX-XXXX`).
     - `type`: `SINGLE_USE` (`maxUses = 1`) or `MULTI_USE` (`maxUses = N`).
     - `assignedRole`: `ADMIN` | `MODERATOR` | `MEMBER` | `VIEWER` (only `ADMIN` can issue `ADMIN` or `MODERATOR` codes).
     - `expiresAt`: Nullable `DateTime` (defaulting to +7 days; supports custom expiry from 1 hour to 90 days).
     - `boundEmail`: Optional email address restriction.
     - `status`: `ACTIVE` | `USED` | `EXPIRED` | `REVOKED`.
2. **Validation & Redemption Rules**:
   - A code is valid if and only if:
     - `status === 'ACTIVE'`
     - `revokedAt === null`
     - `expiresAt === null || expiresAt > now()`
     - `usedCount < maxUses`
     - `boundEmail === null || boundEmail.toLowerCase() === email.toLowerCase()`
   - Redemption executes inside an atomic database transaction (`prisma.$transaction`):
     - Increments `usedCount`.
     - If `usedCount >= maxUses`, transitions `status` to `'USED'` and sets `usedAt = now()`.
     - Creates `InvitationRedemption` linking the `InvitationCode` and the newly created or redeeming `User`.
     - Writes an `AuditLog` entry (`action: "INVITE_REDEEMED"`).
3. **Revocation**:
   - `POST /api/invites/[id]/revoke` sets `status = 'REVOKED'`, `revokedAt = now()`, `revokedById = actor.id`, and writes an `AuditLog` entry (`action: "INVITE_REVOKED"`).
   - Once revoked, any subsequent registration or redemption attempt with that code fails with `400 Bad Request` (`code: "INVITE_REVOKED"`).

### 2.2 Bootstrap Admin Flow (Zero Dummy Users)
- In compliance with the zero-dummy-user requirement, no fake user accounts are pre-populated.
- To onboard the first administrator:
  1. **CLI Command**: `npm run invite:generate -- --role ADMIN --single-use --expires-in-hours 24` creates a single-use `ADMIN` invitation code and prints it to stdout.
  2. **Bootstrap API Endpoint**: `POST /api/invites/bootstrap` (enabled when `User` count is `0` or when authorized with `x-bootstrap-secret: $BOOTSTRAP_ADMIN_SECRET`) generates a single-use `ADMIN` invitation code.
  3. **Login/Register UI**: When the database has `0` registered users, `/register` displays a one-click **"Initialize First Admin Invite Code"** helper button so a live evaluator or administrator can immediately bootstrap the workspace without needing terminal access.

---

## 3. Automation Prompt Compiler Specification

When a user opens an Automation template in `/discover?tab=agents&section=automations`:
- Inputs:
  - `templateTitle` (e.g., `"Daily work brief"`)
  - `intent`: `'Research' | 'Monitor' | 'Create' | 'Analyze' | 'Plan' | 'Coordinate'`
  - `schedule`: `'Run now' | 'Later' | 'Daily' | 'Weekly'`
  - `team`: `string[]` (default `['My Personal AI']`, plus optional specialist agents and human collaborators)
  - `scope`: `'One-shot' | 'Recurring'`
  - `customContext`: Optional user notes
- Output (`compileAutomationPrompt`):
  ```text
  [AUTOMATION: {templateTitle}]
  • Intent: {intent} — {intentDescription}
  • Schedule: {schedule} ({scope})
  • Execution Team: {team.join(', ')}

  Objective:
  Execute "{templateTitle}" with a focus on {intent.toLowerCase()}. Synthesize context from my Living Wiki Memory, recent conversations, and connected apps, then deliver a structured summary and actionable next steps.
  ```

---

## 4. REST API Contract Specification

### 4.1 Authentication, Invites, RBAC & Audit Logs
| Endpoint | Method | Auth / Role | Description |
|---|---|---|---|
| `/api/auth/[...nextauth]` | `GET, POST` | Public | Auth.js / NextAuth session and sign-in/sign-out handlers |
| `/api/auth/register` | `POST` | Public (Requires valid `inviteCode`) | Validates invite code, creates user with `assignedRole`, initializes Personal Agent chat, onboarding tasks, and starter wiki page, records `AuditLog` |
| `/api/invites/verify` | `POST` | Public / Auth | Validates an invite code (`ACTIVE`, `EXPIRED`, `REVOKED`, `USED`, `INVALID_INVITE_CODE`) or redeems it for bonus credits |
| `/api/invites/bootstrap` | `POST` | Public (when `users == 0`) or Secret | Generates initial single-use `ADMIN` invitation code |
| `/api/invites` | `GET, POST` | Auth (`MEMBER`+, role-scoped) | Lists invite codes & summary; creates new single-use or expiring invite codes |
| `/api/invites/[id]/revoke` | `POST` | Auth (`ADMIN`, `MODERATOR`, or creator) | Immediately revokes an invitation code and logs audit event |
| `/api/admin/users` | `GET, PATCH` | Auth (`ADMIN`) | Lists registered users, updates RBAC role (`ADMIN`, `MODERATOR`, `MEMBER`, `VIEWER`), or suspends/revokes user sessions |
| `/api/admin/sessions/[id]/revoke` | `POST` | Auth (`ADMIN` or owner) | Revokes a specific user session or increments `sessionVersion` |
| `/api/admin/audit-logs` | `GET` | Auth (`ADMIN`, `MODERATOR`) | Queries immutable security and operational `AuditLog` entries with filters (`action`, `status`, `actorId`, `search`) |

### 4.2 Chat, Agents, Teams & Automations
| Endpoint | Method | Auth / Role | Description |
|---|---|---|---|
| `/api/conversations` | `GET, POST` | Auth | Lists user's conversations (filtered by tab: `All`, `Agents`, `Groups`, `Contacts`, `Artifacts`, etc.); creates new 1:1 agent chat or multi-agent/human group |
| `/api/conversations/[id]` | `GET, PATCH, DELETE` | Auth | Gets conversation messages & members; updates pin/mute/auto-translate or clears history |
| `/api/conversations/[id]/messages` | `POST` | Auth | Sends a user message, invokes the Agent Engine (`Auto` / `Instant` / `Agentic` mode with selected Skills & Connectors), deducts quota credits, and returns agent replies |
| `/api/conversations/[id]/reactions` | `POST` | Auth | Toggles emoji reaction on a message |
| `/api/agents` | `GET, POST` | Auth | Lists built-in and user-created AI agents & 52 Agent Team templates; creates a custom AI agent |
| `/api/automations` | `GET, POST, PATCH, DELETE` | Auth | Lists Work/Life templates and user's saved automations; creates, toggles, or executes an automation run |

### 4.3 Discover Community Feed, Memory Wiki & Artifacts Studio
| Endpoint | Method | Auth / Role | Description |
|---|---|---|---|
| `/api/posts` | `GET, POST` | Public (`GET`), Auth (`POST`) | Lists community posts by category/search/tab; publishes a new artifact post |
| `/api/posts/[id]` | `GET, POST` | Public (`GET`), Auth (`POST`) | Gets post detail & prompt; handles `like`, `save`, `comment`, `follow`, and `remix` actions |
| `/api/wiki` | `GET, POST` | Auth | Returns Living Wiki pages, knowledge graph (`nodes` & `edges`), updates/conflicts, and next actions; creates a new Wiki page |
| `/api/wiki/[id]` | `GET, PATCH, DELETE` | Auth | Gets or updates a Wiki page (`title`, `content`, `category`, `tags`, `status`), creating a `WikiRevision` |
| `/api/artifacts` | `GET, POST` | Auth | Lists Drive/Studio artifacts by category (`Websites`, `Documents`, `Media`, `Messages`, `Meetings`); creates a Cloud Document, Website, Whiteboard, or Slide deck |
| `/api/artifacts/[id]` | `GET, PATCH, DELETE` | Auth | Reads or saves content in the Tiptap/Artifact Studio (`/tiptap/[id]`) |
| `/api/profile` | `GET, PATCH` | Auth | Gets or updates user profile, `@handle`, bio, social links, and 7 Life Goals |
| `/api/settings` | `GET, PATCH` | Auth | Manages subscription plan, onboarding tasks, credits, channels, API clients, skill API keys, app connectors, MCP servers, and runtimes |

---

## 5. Responsive Layout Breakpoints

- **Desktop (`>= 1024px`)**:
  - Persistent 64px left navigation rail + 320px secondary sidebar (Chat list / Wiki tree / Artifacts tree / Settings menu) + fluid main workspace canvas + optional 340px right profile/inspector drawer.
- **Tablet (`768px – 1023px`)**:
  - Persistent 64px left navigation rail + collapsible secondary sidebar + fluid workspace canvas.
- **Mobile (`< 768px`)**:
  - Fixed 5-item bottom navigation bar (`Chat`, `Agents`, `Discover`, `Memory`, `Artifacts`) + full-width list-to-detail view transitions.
