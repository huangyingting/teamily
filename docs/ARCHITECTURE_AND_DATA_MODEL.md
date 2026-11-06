# Architecture & Data Model — Teamily AI

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client["Next.js App Router Client (Desktop / Tablet / Mobile)"]
        PubUI["Public Marketing Portal\n(/, /login, /register, /pricing, /download, /about)"]
        Shell["Unified Workspace Shell\n(Left Rail + Responsive Bottom Tab Bar)"]
        ChatUI["Chat & Multi-Agent Messaging\n(/chat + Composer + Skills/Connectors/Mode)"]
        AgentsUI["Agents, Agent Teams & Automations\n(/discover?tab=agents & section=automations)"]
        FeedUI["Discover Community Feed & Remix\n(/discover, /post/[id])"]
        MemoryUI["Living Wiki Memory & Graph\n(/memory)"]
        StudioUI["Artifacts Library & Studio\n(/artifacts, /tiptap/[id])"]
        SettingsUI["Profile, Credits, Settings & Security/RBAC\n(/profile, /settings/*)"]
    end

    subgraph Server["Next.js Server & API Route Handlers"]
        AuthGuard["Auth.js / NextAuth + RBAC & Session Version Guard"]
        InviteSvc["Invite-Only Registration & Revocation Service"]
        AuditSvc["Immutable Audit Log Service"]
        AgentEngine["Swarm Agent Runtime & Automation Prompt Compiler"]
        WikiSvc["Living Wiki & Knowledge Graph Service"]
        StudioSvc["Artifact & Cloud Document Studio Service"]
        QuotaSvc["Subscription, 5h Window Quota & Credits Service"]
    end

    subgraph Storage["Prisma ORM Dual-Database Layer"]
        SQLite[("SQLite (Local Dev & E2E)\nfile:./dev.db")]
        Postgres[("PostgreSQL (Production)\npostgresql://...")]
    end

    Client --> AuthGuard
    AuthGuard --> InviteSvc
    AuthGuard --> AuditSvc
    AuthGuard --> AgentEngine
    AuthGuard --> WikiSvc
    AuthGuard --> StudioSvc
    AuthGuard --> QuotaSvc
    InviteSvc --> Storage
    AuditSvc --> Storage
    AgentEngine --> Storage
    WikiSvc --> Storage
    StudioSvc --> Storage
    QuotaSvc --> Storage
```

---

## 2. Authentication, Invite-Only Registration & Revocation Flow

```mermaid
sequenceDiagram
    participant User as Prospective User / Admin
    participant UI as /register or /settings/security
    participant API as /api/auth/register & /api/invites
    participant DB as Prisma (SQLite / PostgreSQL)

    Note over User,DB: 1. Invite Generation (Bootstrap or Admin/Member)
    User->>API: POST /api/invites (singleUse, expiresInHours, assignedRole)
    API->>DB: Insert InvitationCode (status=ACTIVE, maxUses=1, expiresAt)
    API->>DB: Insert AuditLog (action=INVITE_CREATED)
    API-->>UI: Return { code: "TEAM-8F2K9A", expiresAt, assignedRole }

    Note over User,DB: 2. Invite-Only Registration
    User->>UI: Submit Email, Name, Password + Invite Code
    UI->>API: POST /api/auth/register
    API->>DB: Transaction: Check Invite status==ACTIVE, !revokedAt, expiresAt>now, usedCount<maxUses
    alt Invalid / Expired / Revoked / Exhausted
        API->>DB: Insert AuditLog (action=REGISTER_FAILED_INVALID_INVITE, status=FAILURE)
        API-->>UI: 400 Bad Request ("Invalid, expired, or revoked invite code")
    else Valid Invite Code
        API->>DB: Create User (role=invite.assignedRole, sessionVersion=1)
        API->>DB: Update InvitationCode (usedCount+1, status=USED if single-use)
        API->>DB: Create InvitationRedemption
        API->>DB: Provision Personal Agent Chat, 7 Onboarding Tasks, Starter Wiki Page
        API->>DB: Insert AuditLog (action=USER_REGISTERED, status=SUCCESS)
        API-->>UI: 201 Created
    end

    Note over User,DB: 3. Instant Revocation (Invite or Session)
    User->>API: POST /api/invites/[id]/revoke (or /api/admin/sessions/[id]/revoke)
    API->>DB: Mark InvitationCode status=REVOKED (or increment User.sessionVersion)
    API->>DB: Insert AuditLog (action=INVITE_REVOKED / SESSION_REVOKED)
```

---

## 3. Complete Entity-Relationship & Prisma Data Model

### 3.1 Core Security, Users, Invitations, Sessions & Audit Entities

- **`User`**:
  - `id` (String, CUID/UUID PK)
  - `email` (String, Unique)
  - `passwordHash` (String)
  - `name` (String)
  - `handle` (String, Unique, e.g., `@joshuah`)
  - `avatar` (String?)
  - `role` (String: `'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER'`, default `'MEMBER'`)
  - `status` (String: `'ACTIVE' | 'SUSPENDED' | 'REVOKED'`, default `'ACTIVE'`)
  - `sessionVersion` (Int, default `1` — incremented on global session revocation)
  - `bio`, `tags`, `gender`, `location`, `website`, `company`, `githubUrl`, `xUserName`, `telegramUserName`
  - `lifeGoalsJson` (String — JSON storing `health`, `finance`, `career`, `hobbies`, `family`, `productivity`, `other`)
  - `planCode` (String: `'FREE' | 'PLUS' | 'PREMIUM' | 'PRO'`, default `'FREE'`)
  - `creditsCents` (Int, default `0`)
  - `windowCreditsRemaining` (Int, default `500`)
  - `monthlyCreditsUsed` (Int, default `0`)
  - `monthlyCreditsTotal` (Int, default `1500000`)
  - `streakDays` (Int, default `1`)
  - `preferencesJson` (String — theme, language, linkPreviews, taskAlerts, messageFolding)
  - `createdAt`, `updatedAt`

- **`UserSession`**:
  - `id` (String, PK)
  - `userId` (String, FK -> `User`)
  - `sessionToken` (String, Unique)
  - `ipAddress` (String?)
  - `userAgent` (String?)
  - `isRevoked` (Boolean, default `false`)
  - `revokedAt` (DateTime?)
  - `revokedById` (String?)
  - `expiresAt` (DateTime)
  - `lastActiveAt` (DateTime)
  - `createdAt` (DateTime)

- **`InvitationCode`**:
  - `id` (String, PK)
  - `code` (String, Unique, indexed)
  - `createdById` (String?, FK -> `User` — nullable for CLI/bootstrap codes)
  - `assignedRole` (String: `'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER'`, default `'MEMBER'`)
  - `maxUses` (Int, default `1` for single-use)
  - `usedCount` (Int, default `0`)
  - `boundEmail` (String? — optional restriction to a specific email)
  - `note` (String?)
  - `status` (String: `'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED'`, default `'ACTIVE'`)
  - `expiresAt` (DateTime?)
  - `revokedAt` (DateTime?)
  - `revokedById` (String?, FK -> `User`)
  - `createdAt`, `updatedAt`

- **`InvitationRedemption`**:
  - `id` (String, PK)
  - `invitationId` (String, FK -> `InvitationCode`)
  - `redeemedById` (String, FK -> `User`)
  - `rewardCents` (Int, default `100`)
  - `ipAddress` (String?)
  - `redeemedAt` (DateTime)

- **`AuditLog`**:
  - `id` (String, PK)
  - `actorId` (String?, FK -> `User`)
  - `actorEmail` (String?)
  - `actorRole` (String?)
  - `action` (String, indexed — e.g., `INVITE_CREATED`, `INVITE_REDEEMED`, `INVITE_REVOKED`, `REGISTER_FAILED_INVALID_INVITE`, `USER_REGISTERED`, `USER_LOGIN`, `USER_ROLE_UPDATED`, `SESSION_REVOKED`, `API_CLIENT_REVOKED`, `AGENT_CREATED`, `AUTOMATION_EXECUTED`, `WIKI_PAGE_CREATED`, `ARTIFACT_CREATED`, `POST_PUBLISHED`)
  - `targetType` (String — `INVITE`, `USER`, `SESSION`, `AGENT`, `CONVERSATION`, `WIKI`, `ARTIFACT`, `POST`, `SETTINGS`)
  - `targetId` (String?)
  - `status` (String — `'SUCCESS' | 'FAILURE'`)
  - `metadataJson` (String — structured details)
  - `ipAddress` (String?)
  - `userAgent` (String?)
  - `createdAt` (DateTime, indexed)

---

### 3.2 Workspace, Chat, Agents, Automations, Feed, Wiki & Artifacts Entities

- **`Agent`**:
  - `id` (String, PK)
  - `slug` (String, Unique)
  - `name` (String)
  - `description` (String)
  - `systemPrompt` (String)
  - `category` (String — e.g., `Engineering`, `Finance`, `Research`, `Marketing`, `Product`, `Design`, `Life`)
  - `modelName` (String, default `'Qwen3-32B'`)
  - `avatarUrl` (String)
  - `isOfficial` (Boolean, default `false`)
  - `isDefaultPersonal` (Boolean, default `false`)
  - `skillsJson` (String — array of enabled skill slugs)
  - `connectorsJson` (String — array of enabled connector slugs)
  - `creatorId` (String?, FK -> `User`)
  - `usersCount` (String, default `'1.2K+'`)
  - `rating` (String, default `'5.0'`)
  - `createdAt`, `updatedAt`

- **`Conversation`**:
  - `id` (String, PK)
  - `title` (String)
  - `type` (String: `'PERSONAL_AGENT' | 'DIRECT_AGENT' | 'GROUP' | 'DIRECT_USER'`)
  - `ownerId` (String, FK -> `User`)
  - `agentId` (String?, FK -> `Agent`)
  - `isPinned` (Boolean, default `false`)
  - `isMuted` (Boolean, default `false`)
  - `autoTranslate` (Boolean, default `false`)
  - `paymentMode` (String: `'MEMBERS_PAY' | 'OWNER_PAYS'`, default `'MEMBERS_PAY'`)
  - `teamCategory` (String?)
  - `lastMessageText` (String?)
  - `lastMessageAt` (DateTime)
  - `createdAt`, `updatedAt`

- **`ConversationMember`**:
  - `id` (String, PK)
  - `conversationId` (String, FK -> `Conversation`)
  - `memberType` (String: `'USER' | 'AGENT'`)
  - `userId` (String?, FK -> `User`)
  - `agentId` (String?, FK -> `Agent`)
  - `displayName` (String)
  - `role` (String, default `'MEMBER'`)

- **`Message`**:
  - `id` (String, PK)
  - `conversationId` (String, FK -> `Conversation`)
  - `senderType` (String: `'USER' | 'AGENT' | 'SYSTEM'`)
  - `senderUserId` (String?, FK -> `User`)
  - `senderAgentId` (String?, FK -> `Agent`)
  - `senderName` (String)
  - `content` (String)
  - `agentMode` (String: `'Auto' | 'Instant' | 'Agentic'`, default `'Auto'`)
  - `skillsUsedJson` (String)
  - `connectorsUsedJson` (String)
  - `promptsJson` (String — interactive follow-up prompt suggestions)
  - `reactionsJson` (String — map of emoji -> userIds)
  - `artifactId` (String? — linked generated artifact)
  - `createdAt` (DateTime)

- **`Automation`**:
  - `id` (String, PK)
  - `userId` (String, FK -> `User`)
  - `templateSlug` (String)
  - `title` (String)
  - `category` (String: `'Work' | 'Life'`)
  - `intent` (String: `'Research' | 'Monitor' | 'Create' | 'Analyze' | 'Plan' | 'Coordinate'`)
  - `schedule` (String: `'Run now' | 'Later' | 'Daily' | 'Weekly'`)
  - `teamJson` (String)
  - `scope` (String: `'One-shot' | 'Recurring'`)
  - `compiledPrompt` (String)
  - `status` (String: `'ACTIVE' | 'PAUSED' | 'COMPLETED'`)
  - `lastRunAt` (DateTime?)
  - `lastResult` (String?)
  - `createdAt`, `updatedAt`

- **`WikiPage`**:
  - `id` (String, PK)
  - `userId` (String, FK -> `User`)
  - `title` (String)
  - `summary` (String)
  - `content` (String)
  - `category` (String, default `'Getting Started'`)
  - `tagsJson` (String)
  - `status` (String: `'published' | 'conflict' | 'draft'`, default `'published'`)
  - `version` (Int, default `1`)
  - `isNew` (Boolean, default `true`)
  - `createdByKind` (String: `'human' | 'agent'`, default `'human'`)
  - `referencesJson` (String — graph edges to other WikiPage IDs)
  - `createdAt`, `updatedAt`

- **`Artifact`**:
  - `id` (String, PK)
  - `userId` (String, FK -> `User`)
  - `title` (String)
  - `workspaceType` (String: `'tiptap' | 'website' | 'whiteboard' | 'slides' | 'dashboard' | 'media'`)
  - `category` (String: `'Documents' | 'Websites' | 'Media' | 'Messages' | 'Meetings'`)
  - `content` (String)
  - `starred` (Boolean, default `false`)
  - `originKind` (String: `'blank' | 'chat' | 'automation' | 'remix'`)
  - `createdAt`, `updatedAt`

- **`CommunityPost`**:
  - `id` (String, PK)
  - `authorId` (String?, FK -> `User`)
  - `authorName` (String)
  - `authorHandle` (String)
  - `agentName` (String, default `'Super Agent'`)
  - `title` (String)
  - `description` (String)
  - `prompt` (String)
  - `category` (String: `'Webpage' | 'Slides' | 'Dashboard' | 'Article' | 'Mini Game' | 'Mini App' | 'Productivity' | 'AI & Tech'`)
  - `previewHtml` (String)
  - `likesCount` (Int, default `0`)
  - `savesCount` (Int, default `0`)
  - `commentsJson` (String)
  - `createdAt`, `updatedAt`

- **`OnboardingTask`**:
  - `id` (String, PK)
  - `userId` (String, FK -> `User`)
  - `taskCode` (String)
  - `name` (String)
  - `rewardCents` (Int, default `100`)
  - `completed` (Boolean, default `false`)
  - `completedAt` (DateTime?)

- **`UserIntegration`** (Connectors, Channels, Runtimes, Skill Keys & Authorized API Clients):
  - `id` (String, PK)
  - `userId` (String, FK -> `User`)
  - `kind` (String: `'CONNECTOR' | 'CHANNEL' | 'RUNTIME' | 'SKILL_KEY' | 'API_CLIENT' | 'MCP_SERVER'`)
  - `slug` (String)
  - `name` (String)
  - `status` (String: `'CONNECTED' | 'DISCONNECTED' | 'REVOKED'`)
  - `configJson` (String)
  - `createdAt`, `updatedAt`
