import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  FIRST_WEEK_ONBOARDING_TASKS,
  OFFICIAL_AGENTS,
  PLATFORM_CONNECTORS,
  PLATFORM_SKILLS,
} from "./catalog";

export async function ensureSystemAgents() {
  const count = await prisma.agent.count({ where: { isSystem: true } });
  if (count >= OFFICIAL_AGENTS.length) {
    return;
  }

  for (const tpl of OFFICIAL_AGENTS) {
    await prisma.agent.upsert({
      where: { slug: tpl.slug },
      update: {
        name: tpl.name,
        title: tpl.title,
        category: tpl.category,
        description: tpl.description,
        avatarEmoji: tpl.avatarEmoji,
        avatarBg: tpl.avatarBg,
        skillsJson: JSON.stringify(tpl.skills),
        connectorsJson: JSON.stringify(tpl.connectors),
        systemPrompt: tpl.systemPrompt,
        isSystem: true,
        isPublic: true,
      },
      create: {
        slug: tpl.slug,
        name: tpl.name,
        title: tpl.title,
        category: tpl.category,
        description: tpl.description,
        avatarEmoji: tpl.avatarEmoji,
        avatarBg: tpl.avatarBg,
        skillsJson: JSON.stringify(tpl.skills),
        connectorsJson: JSON.stringify(tpl.connectors),
        systemPrompt: tpl.systemPrompt,
        isSystem: true,
        isPublic: true,
      },
    });
  }
}

export async function provisionUserWorkspace(
  tx: Prisma.TransactionClient,
  user: { id: string; name: string; handle: string; email: string }
) {
  // 1. Ensure Official Teamily Agent exists inside transaction
  let teamilyAgent = await tx.agent.findUnique({
    where: { slug: "teamily-agent" },
  });
  if (!teamilyAgent) {
    const tpl = OFFICIAL_AGENTS[0];
    teamilyAgent = await tx.agent.create({
      data: {
        slug: tpl.slug,
        name: tpl.name,
        title: tpl.title,
        category: tpl.category,
        description: tpl.description,
        avatarEmoji: tpl.avatarEmoji,
        avatarBg: tpl.avatarBg,
        skillsJson: JSON.stringify(tpl.skills),
        connectorsJson: JSON.stringify(tpl.connectors),
        systemPrompt: tpl.systemPrompt,
        isSystem: true,
        isPublic: true,
      },
    });
  }

  // 2. Create user's dedicated Personal Agent
  const personalAgentSlug = `personal-agent-${user.handle}-${Date.now().toString(36)}`;
  const personalAgent = await tx.agent.create({
    data: {
      slug: personalAgentSlug,
      name: `${user.name}'s Personal Agent`,
      title: "Personal AI Chief of Staff & Memory Companion",
      category: "Personal",
      description: `Dedicated Personal Agent for ${user.name}. Manages your Living Wiki, daily briefings, artifacts, and multi-agent collaborations.`,
      systemPrompt: `You are ${user.name}'s Personal Agent on Teamily AI. Keep track of their preferences, Living Wiki, and goals.`,
      avatarEmoji: "🤖",
      avatarBg: "#087c45",
      skillsJson: JSON.stringify(["web-search", "living-wiki", "artifact-builder", "swarm-router"]),
      connectorsJson: JSON.stringify(["google-calendar", "notion", "github"]),
      isSystem: false,
      isPublic: false,
      ownerId: user.id,
    },
  });

  // 3. Create pinned Personal Agent Conversation
  const personalConv = await tx.conversation.create({
    data: {
      title: "Personal Agent",
      type: "PERSONAL",
      mode: "Auto",
      isPinned: true,
      ownerId: user.id,
      members: {
        create: [
          {
            memberType: "USER",
            userId: user.id,
            displayName: user.name,
            avatarEmoji: "👤",
          },
          {
            memberType: "AGENT",
            agentId: personalAgent.id,
            displayName: personalAgent.name,
            avatarEmoji: "🤖",
          },
        ],
      },
      messages: {
        create: [
          {
            senderType: "AGENT",
            senderName: personalAgent.name,
            agentId: personalAgent.id,
            mode: "Auto",
            content: `Hi **${user.name}**! Welcome to your **Teamily AI** workspace.\n\nI'm your **Personal Agent** — I work alongside specialist AI agents, scheduled automations, and your **Living Wiki** memory.\n\nHere are a few things we can do right now:\n- **Ask me anything** in \`Auto\`, \`Instant\`, or deep \`Agentic\` mode\n- **Create a Multi-Agent Group** in the sidebar to bring specialists like *Ray*, *Steve*, *Elon*, or *Aria* into one room\n- **Schedule a Daily Briefing** in **Discover → Automations**`,
            metadataJson: JSON.stringify({
              steps: ["Initialized Personal Agent memory", "Linked Living Wiki graph"],
              creditsUsed: 0,
            }),
          },
        ],
      },
    },
  });

  // 4. Create pinned Official Teamily Agent Conversation
  await tx.conversation.create({
    data: {
      title: "Teamily Agent",
      type: "DIRECT_AGENT",
      mode: "Auto",
      isPinned: true,
      ownerId: user.id,
      members: {
        create: [
          {
            memberType: "USER",
            userId: user.id,
            displayName: user.name,
            avatarEmoji: "👤",
          },
          {
            memberType: "AGENT",
            agentId: teamilyAgent.id,
            displayName: teamilyAgent.name,
            avatarEmoji: teamilyAgent.avatarEmoji,
          },
        ],
      },
      messages: {
        create: [
          {
            senderType: "AGENT",
            senderName: teamilyAgent.name,
            agentId: teamilyAgent.id,
            mode: "Auto",
            content:
              "Welcome to **Teamily AI**! I'm the official workspace concierge. You can @mention any specialist agent, spin up a multi-agent war room, or ask me to generate an interactive HTML/Document artifact.",
            metadataJson: JSON.stringify({
              steps: ["Workspace Concierge Ready"],
              creditsUsed: 0,
            }),
          },
        ],
      },
    },
  });

  // 5. Create 7 First-Week Onboarding Tasks
  for (const task of FIRST_WEEK_ONBOARDING_TASKS) {
    await tx.onboardingTask.create({
      data: {
        userId: user.id,
        dayNumber: task.dayNumber,
        title: task.title,
        description: task.description,
        isCompleted: task.dayNumber === 1,
      },
    });
  }

  // 6. Create Starter Living Wiki Pages
  await tx.wikiPage.create({
    data: {
      ownerId: user.id,
      title: "Welcome to Your Living Wiki",
      slug: `welcome-living-wiki-${user.id.slice(0, 6)}`,
      icon: "🌿",
      category: "Workspace Core",
      tagsJson: JSON.stringify(["Onboarding", "Architecture", "Memory"]),
      content: `# Welcome to Your Living Wiki, ${user.name}\n\nYour **Living Wiki** is the persistent, structured memory shared between you and your AI agent team.\n\n## How It Works\n1. **Automatic Memory Synthesis**: When you chat with your Personal Agent or run a Multi-Agent Group, key decisions and preferences are indexed here.\n2. **Knowledge Graph**: Visit the **Overview** tab to inspect how your projects, agents, and documents connect.\n3. **Next Actions**: Actionable commitments extracted from chats and meetings appear in **Next Actions**.\n\n## Current Priorities\n- [ ] Define Q2/Q3 product & research priorities\n- [ ] Configure a Daily Morning Executive Briefing automation\n- [ ] Assemble your first Multi-Agent Group room`,
    },
  });

  await tx.wikiPage.create({
    data: {
      ownerId: user.id,
      title: "Product & Strategic Principles",
      slug: `strategic-principles-${user.id.slice(0, 6)}`,
      icon: "🧭",
      category: "Strategy",
      tagsJson: JSON.stringify(["Strategy", "Decisions", "Principles"]),
      content: `# Product & Strategic Principles\n\nThis page tracks core operating principles referenced by **Ray**, **Steve**, **Elon**, and your **Personal Agent** during strategy reviews.\n\n### Core Tenets\n- **First-Principles Clarity**: Question every constraint before optimizing a workflow.\n- **Human + AI Leverage**: Automate repetitive synthesis so human judgment focuses on high-conviction decisions.\n- **Compounding Memory**: Every resolved thread should leave the Living Wiki smarter than before.`,
    },
  });

  // 7. Create Starter Cloud Document Artifact (TipTap compatible)
  await tx.artifact.create({
    data: {
      ownerId: user.id,
      conversationId: personalConv.id,
      title: "Workspace Launchpad & Q2 Roadmap Spec",
      type: "DOCUMENT",
      content: `<h1>Workspace Launchpad &amp; Q2 Roadmap Spec</h1><p>Welcome to <strong>Teamily Cloud Documents</strong> — a collaborative TipTap editor integrated directly with your AI agents and Artifacts library.</p><h2>1. Executive Summary</h2><p>Use this space to draft product specifications, research dossiers, and executive memos alongside your Personal Agent.</p><h2>2. Key Milestones</h2><ul><li><strong>Phase 1</strong>: Configure Personal Agent context and Living Wiki graph</li><li><strong>Phase 2</strong>: Launch daily automated intelligence briefings</li><li><strong>Phase 3</strong>: Deploy multi-agent teams across product, engineering, and growth</li></ul>`,
      previewText:
        "Welcome to Teamily Cloud Documents — a collaborative TipTap editor integrated directly with your AI agents and Artifacts library.",
      isFavorited: true,
    },
  });

  // 8. Provision Default Skills & Connectors states
  for (const skill of PLATFORM_SKILLS.slice(0, 5)) {
    await tx.userIntegration.create({
      data: {
        userId: user.id,
        category: "SKILL",
        key: skill.id,
        name: skill.name,
        isEnabled: skill.enabledByDefault,
        configJson: JSON.stringify({ provider: skill.provider }),
      },
    });
  }

  for (const conn of PLATFORM_CONNECTORS.slice(0, 4)) {
    await tx.userIntegration.create({
      data: {
        userId: user.id,
        category: "CONNECTOR",
        key: conn.id,
        name: conn.name,
        isEnabled: false,
        configJson: JSON.stringify({ authType: conn.authType }),
      },
    });
  }

  return { personalConvId: personalConv.id };
}
