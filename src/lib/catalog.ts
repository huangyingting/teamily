export interface SystemAgentTemplate {
  slug: string;
  name: string;
  title: string;
  category: string;
  description: string;
  avatarEmoji: string;
  avatarBg: string;
  skills: string[];
  connectors: string[];
  systemPrompt: string;
  greeting: string;
  suggestions: string[];
}

export interface AgentTeamTemplate {
  id: string;
  name: string;
  category: "Executive & Ops" | "Market & Growth" | "Engineering & Data" | "Creative & Design" | "Finance & Legal";
  description: string;
  leadAgent: string;
  members: { name: string; role: string; emoji: string }[];
  skills: string[];
  connectors: string[];
  badge: string;
}

export interface AutomationChip {
  id: string;
  label: string;
  options: string[];
  defaultOption: string;
}

export interface AutomationTemplate {
  id: string;
  title: string;
  category: "Work" | "Life";
  subCategory: string;
  description: string;
  icon: string;
  defaultSchedule: "daily" | "weekly" | "monthly" | "once";
  defaultTime: string;
  defaultTimezone: string;
  promptTemplate: string;
  chips: AutomationChip[];
}

export interface SkillDefinition {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: "Research" | "Productivity" | "Creation" | "Developer" | "Memory";
  enabledByDefault: boolean;
  icon: string;
}

export interface ConnectorDefinition {
  id: string;
  name: string;
  category: "Workspace" | "Knowledge" | "Engineering" | "Communication" | "Consumer";
  description: string;
  authType: "OAuth 2.0" | "API Token";
  icon: string;
  color: string;
}

export interface PricingTier {
  id: "free" | "plus" | "pro" | "max";
  name: string;
  monthlyPrice: number;
  annualPricePerMonth: number;
  tagline: string;
  highlighted?: boolean;
  badge?: string;
  creditsPerMonth: number;
  dailyRefreshCredits: number;
  features: string[];
}

export const OFFICIAL_AGENTS: SystemAgentTemplate[] = [
  {
    slug: "teamily-agent",
    name: "Teamily Agent",
    title: "Official Teamily AI Concierge & Workspace Orchestrator",
    category: "Official",
    description:
      "Official platform guide and multi-agent orchestrator. Coordinates specialist agents, automations, skills, and living memory across your workspace.",
    avatarEmoji: "🌿",
    avatarBg: "#087c45",
    skills: ["web-search", "living-wiki", "artifact-builder", "swarm-router"],
    connectors: ["google-calendar", "gmail", "notion", "github"],
    systemPrompt:
      "You are Teamily Agent, the official orchestrator of Teamily AI. Provide structured, actionable answers and coordinate specialist agents when helpful.",
    greeting:
      "Welcome to Teamily AI! I'm your official workspace orchestrator. Ask me to coordinate a specialist agent team, set up a recurring automation, or synthesize your Living Wiki.",
    suggestions: [
      "Assemble a 3-agent product launch team for Q2",
      "Create a daily 9:00 AM AI & tech news briefing automation",
      "Summarize my workspace Living Wiki and suggest next actions",
    ],
  },
  {
    slug: "ray-dalio-advisor",
    name: "Ray",
    title: "Macro Principles & Decision Architect",
    category: "Strategy & Finance",
    description:
      "Applies radical transparency, first-principles macro analysis, and Bridgewater-inspired decision matrices to complex strategic choices.",
    avatarEmoji: "🧭",
    avatarBg: "#1d4ed8",
    skills: ["web-search", "financial-modeling", "decision-matrix"],
    connectors: ["google-drive", "notion"],
    systemPrompt:
      "You are Ray, a macro strategy and decision principles advisor. Break problems down into first principles, probabilities, and second/third-order consequences.",
    greeting:
      "Let's examine your toughest strategic decision through radical truth and first principles. What outcome are you optimizing for, and what are the key risks?",
    suggestions: [
      "Stress-test our 18-month runway and pricing strategy",
      "Build a weighted decision matrix for entering a new market",
      "Analyze macro tailwinds and headwinds for AI SaaS in 2026",
    ],
  },
  {
    slug: "elon-first-principles",
    name: "Elon",
    title: "First-Principles Engineering & Velocity Catalyst",
    category: "Engineering & Product",
    description:
      "Questions every requirement, deletes unnecessary steps, compresses timelines, and drives 10x product & engineering execution.",
    avatarEmoji: "🚀",
    avatarBg: "#0f172a",
    skills: ["code-interpreter", "system-architecture", "artifact-builder"],
    connectors: ["github", "linear"],
    systemPrompt:
      "You are Elon, a first-principles engineering catalyst. Apply the 5-step engineering algorithm: make requirements less dumb, delete the part/process, simplify, accelerate, then automate.",
    greeting:
      "Tell me the bottleneck blocking your product right now. Let's question the constraints, delete half the complexity, and ship it this week.",
    suggestions: [
      "Audit our onboarding flow and cut steps by 60%",
      "Design a high-throughput event architecture from first principles",
      "Create a 7-day sprint plan to ship our MVP",
    ],
  },
  {
    slug: "naval-leverage",
    name: "Naval",
    title: "Specific Knowledge, Leverage & Wealth Philosopher",
    category: "Strategy & Mindset",
    description:
      "Helps founders and creators compound code, media, capital, and judgment while maintaining clarity of mind.",
    avatarEmoji: "⚡",
    avatarBg: "#4338ca",
    skills: ["living-wiki", "essay-synthesizer", "web-search"],
    connectors: ["x-twitter", "notion"],
    systemPrompt:
      "You are Naval, focused on leverage (code and media), specific knowledge, long-term compounding games, and clear aphoristic thinking.",
    greeting:
      "Clear thinking precedes clear execution. Where are you building permissionless leverage with code and media today?",
    suggestions: [
      "Help me articulate my unique specific knowledge and positioning",
      "Reframe our product roadmap around zero-marginal-cost leverage",
      "Draft a crisp 5-point memo on long-term compounding product loops",
    ],
  },
  {
    slug: "steve-craft",
    name: "Steve",
    title: "Product Taste, Narrative & Insanely Great Craft",
    category: "Design & Product",
    description:
      "Obsesses over user experience, simplicity, end-to-end product storytelling, and eliminating feature bloat.",
    avatarEmoji: "🍎",
    avatarBg: "#111827",
    skills: ["ui-critique", "keynote-storyteller", "artifact-builder"],
    connectors: ["figma", "notion"],
    systemPrompt:
      "You are Steve, a product design and storytelling visionary. Insist on deep simplicity, emotional resonance, and saying no to 1,000 good ideas so the core experience shines.",
    greeting:
      "Simplicity is the ultimate sophistication. Show me what you're building and let's strip away everything that isn't essential.",
    suggestions: [
      "Critique our landing page narrative and hero messaging",
      "Write a keynote-style product launch script",
      "Simplify our 6-tab navigation into an intuitive user journey",
    ],
  },
  {
    slug: "paul-graham-essays",
    name: "Paul",
    title: "Startup Instincts, Counterintuitive Truths & Writing",
    category: "Startups & Writing",
    description:
      "Helps you find product-market fit, talk to users, do things that don't scale, and write clear, persuasive essays.",
    avatarEmoji: "🟧",
    avatarBg: "#ea580c",
    skills: ["essay-synthesizer", "user-interview-analyzer", "web-search"],
    connectors: ["gmail", "notion"],
    systemPrompt:
      "You are Paul, a startup mentor and essayist. Speak plainly, challenge conventional wisdom, and focus relentlessly on making something people genuinely want.",
    greeting:
      "What have you learned from talking to your users this week that surprised you?",
    suggestions: [
      "Review my investor update for clarity and traction signals",
      "Design 10 high-signal user interview questions that avoid fluff",
      "Help me turn this rough note into a sharp 800-word essay",
    ],
  },
  {
    slug: "sam-scale",
    name: "Sam",
    title: "AI Frontier Strategy & Exponential Scaling",
    category: "AI & Growth",
    description:
      "Guides teams building native agentic workflows, AI moats, compute-scaled products, and ambitious company roadmaps.",
    avatarEmoji: "✨",
    avatarBg: "#059669",
    skills: ["web-search", "swarm-router", "system-architecture"],
    connectors: ["github", "slack", "linear"],
    systemPrompt:
      "You are Sam, focused on ambitious scale, agentic AI systems, compounding team velocity, and building for where foundation models will be in 12 months.",
    greeting:
      "Build for where AI capability is going, not where it was six months ago. How can we make your workflow 10x more autonomous?",
    suggestions: [
      "Architect a multi-agent swarm workflow for customer operations",
      "Identify which parts of our product become 10x better with autonomous agents",
      "Draft our Q3 AI product thesis and milestone plan",
    ],
  },
  {
    slug: "deep-research-analyst",
    name: "Aria — Deep Research Lead",
    title: "Multi-Source Intelligence & Competitive Synthesizer",
    category: "Research",
    description:
      "Synthesizes primary sources, filings, benchmarks, and market signals into structured HTML/Markdown dossiers with citations.",
    avatarEmoji: "🔬",
    avatarBg: "#0284c7",
    skills: ["web-search", "academic-digest", "artifact-builder", "living-wiki"],
    connectors: ["google-drive", "notion", "feishu"],
    systemPrompt:
      "You are Aria, Teamily's Deep Research Lead. Produce structured, citation-backed competitive intelligence briefs and save takeaways to the Living Wiki.",
    greeting:
      "Ready to run a deep-dive investigation. Give me a company, technology, or market vertical and I'll compile a structured intelligence brief.",
    suggestions: [
      "Compare top 5 autonomous AI workspace platforms in a feature matrix",
      "Compile a deep-dive market sizing report on AI coding & workspace agents",
      "Generate an interactive HTML research brief from our recent notes",
    ],
  },
  {
    slug: "fullstack-architect",
    name: "Marcus — Principal Staff Engineer",
    title: "TypeScript, Next.js, Distributed Systems & Security Reviewer",
    category: "Engineering",
    description:
      "Designs production schemas, API contracts, interactive prototypes, and security-hardened cloud architectures.",
    avatarEmoji: "🛠️",
    avatarBg: "#7c3aed",
    skills: ["code-interpreter", "system-architecture", "artifact-builder", "security-audit"],
    connectors: ["github", "linear", "slack"],
    systemPrompt:
      "You are Marcus, Principal Staff Engineer. Provide concrete TypeScript/SQL/architecture artifacts, edge-case analyses, and clean implementation plans.",
    greeting:
      "Let's build something rock-solid. Need a system architecture diagram, an interactive prototype artifact, or a security review?",
    suggestions: [
      "Generate an interactive system health dashboard artifact",
      "Review our RBAC and invite redemption flow for race conditions",
      "Design a zero-downtime SQLite-to-PostgreSQL migration checklist",
    ],
  },
  {
    slug: "growth-cmo",
    name: "Elena — Growth & Narrative CMO",
    title: "Go-To-Market, Viral Loops & Community Storytelling",
    category: "Market & Growth",
    description:
      "Crafts high-converting launch campaigns, viral invite loops, pricing experiments, and community content calendars.",
    avatarEmoji: "📈",
    avatarBg: "#db2777",
    skills: ["web-search", "copywriting-studio", "artifact-builder"],
    connectors: ["x-twitter", "xiaohongshu", "gmail", "notion"],
    systemPrompt:
      "You are Elena, Growth & Narrative CMO. Combine quantitative funnel diagnostics with magnetic product storytelling.",
    greeting:
      "Let's turn your product into a movement. Want to design a viral invite loop, sharpen your pricing page, or draft a multi-channel launch thread?",
    suggestions: [
      "Design an invite-only referral loop with tiered creator rewards",
      "Write a high-converting Product Hunt & X launch campaign",
      "Build an interactive ROI calculator artifact for enterprise buyers",
    ],
  },
];

export const AGENT_TEAMS: AgentTeamTemplate[] = [
  {
    id: "team-product-launch-warroom",
    name: "Product Launch War Room",
    category: "Market & Growth",
    description:
      "Coordinates positioning, keynote copy, competitive battlecards, and launch-day social threads in one synchronized multi-agent room.",
    leadAgent: "Steve",
    members: [
      { name: "Steve", role: "Narrative & Positioning", emoji: "🍎" },
      { name: "Elena", role: "GTM & Viral Loops", emoji: "📈" },
      { name: "Aria", role: "Competitive Battlecards", emoji: "🔬" },
    ],
    skills: ["web-search", "keynote-storyteller", "copywriting-studio", "artifact-builder"],
    connectors: ["notion", "x-twitter", "slack"],
    badge: "Popular",
  },
  {
    id: "team-executive-board",
    name: "Founders Advisory Board",
    category: "Executive & Ops",
    description:
      "Debates strategic tradeoffs from macro principles, first-principles velocity, and long-term leverage before synthesizing a unified board memo.",
    leadAgent: "Ray",
    members: [
      { name: "Ray", role: "Macro & Risk Matrix", emoji: "🧭" },
      { name: "Naval", role: "Leverage & Positioning", emoji: "⚡" },
      { name: "Paul", role: "PMF & User Truth", emoji: "🟧" },
    ],
    skills: ["decision-matrix", "financial-modeling", "essay-synthesizer"],
    connectors: ["notion", "google-drive"],
    badge: "Featured",
  },
  {
    id: "team-autonomous-eng",
    name: "Autonomous Architecture & Security Squad",
    category: "Engineering & Data",
    description:
      "Designs full-stack specs, Prisma data models, security threat models, and interactive HTML/React artifacts.",
    leadAgent: "Marcus — Principal Staff Engineer",
    members: [
      { name: "Marcus", role: "System Architecture", emoji: "🛠️" },
      { name: "Elon", role: "Complexity Deletion", emoji: "🚀" },
      { name: "Sam", role: "Agentic Workflows", emoji: "✨" },
    ],
    skills: ["system-architecture", "code-interpreter", "security-audit", "artifact-builder"],
    connectors: ["github", "linear", "slack"],
    badge: "Engineering",
  },
  {
    id: "team-daily-intel-desk",
    name: "Global Market & AI Intelligence Desk",
    category: "Market & Growth",
    description:
      "Monitors global AI releases, funding rounds, ArXiv papers, and macro catalysts, distilling them into your Living Wiki.",
    leadAgent: "Aria — Deep Research Lead",
    members: [
      { name: "Aria", role: "Primary Source Research", emoji: "🔬" },
      { name: "Ray", role: "Macro Synthesis", emoji: "🧭" },
      { name: "Sam", role: "AI Ecosystem Signals", emoji: "✨" },
    ],
    skills: ["web-search", "academic-digest", "living-wiki"],
    connectors: ["feishu", "notion", "gmail"],
    badge: "Research",
  },
  {
    id: "team-creator-studio",
    name: "Multi-Channel Creator Studio",
    category: "Creative & Design",
    description:
      "Transforms raw meeting notes and wiki memories into polished essays, X threads, Xiaohongshu visual cards, and newsletter issues.",
    leadAgent: "Elena — Growth & Narrative CMO",
    members: [
      { name: "Elena", role: "Channel Strategy", emoji: "📈" },
      { name: "Paul", role: "Longform Essayist", emoji: "🟧" },
      { name: "Steve", role: "Visual Taste & Hook", emoji: "🍎" },
    ],
    skills: ["copywriting-studio", "essay-synthesizer", "artifact-builder"],
    connectors: ["x-twitter", "xiaohongshu", "notion"],
    badge: "Creator",
  },
  {
    id: "team-chief-of-staff",
    name: "Executive Chief of Staff Office",
    category: "Executive & Ops",
    description:
      "Triages inbox priorities, preps meeting dossiers, extracts next actions into Memory, and drafts follow-up memos automatically.",
    leadAgent: "Teamily Agent",
    members: [
      { name: "Teamily Agent", role: "Orchestrator", emoji: "🌿" },
      { name: "Aria", role: "Meeting Dossier Prep", emoji: "🔬" },
      { name: "Marcus", role: "Workflow Automation", emoji: "🛠️" },
    ],
    skills: ["living-wiki", "swarm-router", "web-search"],
    connectors: ["google-calendar", "gmail", "slack", "feishu"],
    badge: "Productivity",
  },
  {
    id: "team-quant-diligence",
    name: "Venture & Deal Diligence Committee",
    category: "Finance & Legal",
    description:
      "Evaluates pitch decks, unit economics, cohort retention, technical defensibility, and red-flag risks in minutes.",
    leadAgent: "Ray",
    members: [
      { name: "Ray", role: "Unit Economics & Risk", emoji: "🧭" },
      { name: "Paul", role: "Founder & PMF Signal", emoji: "🟧" },
      { name: "Marcus", role: "Tech Moat Audit", emoji: "🛠️" },
    ],
    skills: ["financial-modeling", "decision-matrix", "web-search"],
    connectors: ["google-drive", "notion"],
    badge: "Finance",
  },
  {
    id: "team-customer-voice",
    name: "Customer Insight & Retention Lab",
    category: "Market & Growth",
    description:
      "Clusters user feedback, support transcripts, and community discussions into prioritized product specs and roadmap actions.",
    leadAgent: "Paul",
    members: [
      { name: "Paul", role: "User Truth Synthesis", emoji: "🟧" },
      { name: "Steve", role: "UX Simplification", emoji: "🍎" },
      { name: "Elena", role: "Lifecycle Messaging", emoji: "📈" },
    ],
    skills: ["user-interview-analyzer", "living-wiki", "artifact-builder"],
    connectors: ["slack", "linear", "notion"],
    badge: "Product",
  },
];

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: "auto-morning-briefing",
    title: "Daily Morning Executive Briefing",
    category: "Work",
    subCategory: "Daily Briefings",
    description:
      "Wake up to a curated synthesis of your calendar, key industry news, and top 3 priorities delivered to your Personal Agent chat.",
    icon: "🌅",
    defaultSchedule: "daily",
    defaultTime: "08:30",
    defaultTimezone: "America/Los_Angeles",
    promptTemplate:
      "Every morning, compile a concise {format} covering {topic}, check my upcoming schedule priorities, and highlight {actionCount} high-leverage focus items for today.",
    chips: [
      {
        id: "format",
        label: "Format",
        options: ["executive bullet briefing", "structured 3-minute memo", "audio-ready script"],
        defaultOption: "executive bullet briefing",
      },
      {
        id: "topic",
        label: "Focus Area",
        options: ["AI agents & SaaS markets", "global macro & tech equities", "product & engineering velocity"],
        defaultOption: "AI agents & SaaS markets",
      },
      {
        id: "actionCount",
        label: "Action Items",
        options: ["top 3", "top 5", "single #1"],
        defaultOption: "top 3",
      },
    ],
  },
  {
    id: "auto-competitor-radar",
    title: "Competitor & Market Launch Radar",
    category: "Work",
    subCategory: "Research & Intel",
    description:
      "Tracks competitor product updates, pricing changes, changelog releases, and social sentiment with citations saved to your Living Wiki.",
    icon: "📡",
    defaultSchedule: "daily",
    defaultTime: "09:00",
    defaultTimezone: "America/Los_Angeles",
    promptTemplate:
      "Scan recent announcements and community discussions across {domain}, identify notable product launches or pricing shifts, and deliver a {depth} with strategic takeaways.",
    chips: [
      {
        id: "domain",
        label: "Market Domain",
        options: ["autonomous AI workspaces", "developer tools & coding agents", "fintech & B2B SaaS"],
        defaultOption: "autonomous AI workspaces",
      },
      {
        id: "depth",
        label: "Report Depth",
        options: ["5-bullet competitive radar", "comparison matrix table", "deep-dive battlecard"],
        defaultOption: "5-bullet competitive radar",
      },
    ],
  },
  {
    id: "auto-github-pr-digest",
    title: "Engineering Velocity & PR Risk Digest",
    category: "Work",
    subCategory: "Engineering",
    description:
      "Summarizes merged PRs, open blockers, security advisories, and architectural changes across your repositories.",
    icon: "⚙️",
    defaultSchedule: "daily",
    defaultTime: "10:00",
    defaultTimezone: "America/Los_Angeles",
    promptTemplate:
      "Review activity across {repoScope}, flag any high-risk changes or stalled blockers in {focusArea}, and post a {summaryStyle} for the engineering team.",
    chips: [
      {
        id: "repoScope",
        label: "Scope",
        options: ["core application repositories", "frontend & design system", "API & database migrations"],
        defaultOption: "core application repositories",
      },
      {
        id: "focusArea",
        label: "Focus",
        options: ["security & auth boundaries", "performance & latency", "release readiness"],
        defaultOption: "security & auth boundaries",
      },
      {
        id: "summaryStyle",
        label: "Output Style",
        options: ["standup-ready changelog", "technical risk scorecard", "release notes draft"],
        defaultOption: "standup-ready changelog",
      },
    ],
  },
  {
    id: "auto-weekly-wiki-gardener",
    title: "Living Wiki Knowledge Gardener",
    category: "Work",
    subCategory: "Memory & Wiki",
    description:
      "Synthesizes the week's conversations, decisions, and artifacts into structured Living Wiki pages and cleans up stale action items.",
    icon: "🧠",
    defaultSchedule: "weekly",
    defaultTime: "17:00",
    defaultTimezone: "America/Los_Angeles",
    promptTemplate:
      "Review all conversations and artifacts from the past week, extract {extractionType}, update our Living Wiki index, and propose {nextStepStyle} for next week.",
    chips: [
      {
        id: "extractionType",
        label: "Extract",
        options: ["key architectural & product decisions", "customer insights & objections", "team commitments & OKRs"],
        defaultOption: "key architectural & product decisions",
      },
      {
        id: "nextStepStyle",
        label: "Next Actions",
        options: ["prioritized P0/P1 next actions", "owner-assigned sprint tasks", "strategic reflection questions"],
        defaultOption: "prioritized P0/P1 next actions",
      },
    ],
  },
  {
    id: "auto-creator-content-engine",
    title: "Creator Thought-Leadership Draft Engine",
    category: "Work",
    subCategory: "Content & Growth",
    description:
      "Turns your workspace insights and industry trends into ready-to-publish social posts, newsletter sections, and visual hooks.",
    icon: "✍️",
    defaultSchedule: "daily",
    defaultTime: "11:00",
    defaultTimezone: "America/Los_Angeles",
    promptTemplate:
      "Synthesize our latest workspace insights on {theme} into {contentFormat} written in a {tone} voice.",
    chips: [
      {
        id: "theme",
        label: "Theme",
        options: ["human + AI multi-agent collaboration", "startup execution & product craft", "software engineering in 2026"],
        defaultOption: "human + AI multi-agent collaboration",
      },
      {
        id: "contentFormat",
        label: "Deliverable",
        options: ["an X thread + LinkedIn post", "a 600-word newsletter essay", "3 Xiaohongshu story cards"],
        defaultOption: "an X thread + LinkedIn post",
      },
      {
        id: "tone",
        label: "Tone",
        options: ["crisp founder-operator", "contrarian & analytical", "warm & narrative-driven"],
        defaultOption: "crisp founder-operator",
      },
    ],
  },
  {
    id: "auto-investor-metrics-pulse",
    title: "Weekly Founder KPI & Runway Pulse",
    category: "Work",
    subCategory: "Executive & Ops",
    description:
      "Compiles weekly growth metrics, credit consumption, activation funnel health, and strategic anomalies into an executive memo.",
    icon: "📊",
    defaultSchedule: "weekly",
    defaultTime: "08:00",
    defaultTimezone: "America/Los_Angeles",
    promptTemplate:
      "Analyze our weekly workspace metrics focusing on {metricFocus}, highlight the biggest growth driver and bottleneck, and format as {memoFormat}.",
    chips: [
      {
        id: "metricFocus",
        label: "KPI Focus",
        options: ["user activation & retention", "revenue & net dollar retention", "agent automation engagement"],
        defaultOption: "user activation & retention",
      },
      {
        id: "memoFormat",
        label: "Format",
        options: ["a 1-page founder pulse memo", "an investor update draft", "a board KPI table"],
        defaultOption: "a 1-page founder pulse memo",
      },
    ],
  },
  {
    id: "auto-arxiv-paper-scout",
    title: "Frontier AI Paper & Benchmark Scout",
    category: "Work",
    subCategory: "Research & Intel",
    description:
      "Monitors new AI research papers, open-source model weights, and agent evaluation benchmarks with practical engineering takeaways.",
    icon: "📚",
    defaultSchedule: "daily",
    defaultTime: "12:00",
    defaultTimezone: "America/Los_Angeles",
    promptTemplate:
      "Scout the latest research papers and open-source releases in {researchArea}, explain the core breakthrough in plain language, and suggest {applicationType}.",
    chips: [
      {
        id: "researchArea",
        label: "Research Area",
        options: ["multi-agent orchestration & memory", "reasoning models & tool use", "multimodal & realtime voice"],
        defaultOption: "multi-agent orchestration & memory",
      },
      {
        id: "applicationType",
        label: "Takeaway Type",
        options: ["concrete product experiments we can run", "architecture upgrades for our stack", "benchmark comparisons"],
        defaultOption: "concrete product experiments we can run",
      },
    ],
  },
  {
    id: "auto-evening-reflection",
    title: "Evening Shutdown & Cognitive Unload",
    category: "Life",
    subCategory: "Personal Clarity",
    description:
      "Closes out your workday by capturing open loops into Memory, celebrating wins, and setting a calm intention for tomorrow.",
    icon: "🌙",
    defaultSchedule: "daily",
    defaultTime: "18:30",
    defaultTimezone: "America/Los_Angeles",
    promptTemplate:
      "Guide me through a {duration} evening review: capture any unfinished open loops from today, log {reflectionFocus} into my Living Wiki, and lock in tomorrow's #1 priority.",
    chips: [
      {
        id: "duration",
        label: "Pace",
        options: ["3-minute rapid", "5-minute deep", "bullet-point"],
        defaultOption: "3-minute rapid",
      },
      {
        id: "reflectionFocus",
        label: "Reflection Focus",
        options: ["3 wins and 1 lesson learned", "energy & focus audit", "gratitude & clarity notes"],
        defaultOption: "3 wins and 1 lesson learned",
      },
    ],
  },
  {
    id: "auto-health-longevity-coach",
    title: "Longevity, Sleep & Deep Work Rhythm Coach",
    category: "Life",
    subCategory: "Health & Energy",
    description:
      "Aligns your deep-work blocks with ultradian energy rhythms, mobility breaks, nutrition reminders, and recovery protocols.",
    icon: "🏃",
    defaultSchedule: "daily",
    defaultTime: "07:30",
    defaultTimezone: "America/Los_Angeles",
    promptTemplate:
      "Design today's energy & focus protocol around {goal} with a {workoutStyle} session and two 90-minute deep-work blocks.",
    chips: [
      {
        id: "goal",
        label: "Primary Goal",
        options: ["sustained cognitive stamina", "VO2 max & metabolic health", "stress recovery & sleep quality"],
        defaultOption: "sustained cognitive stamina",
      },
      {
        id: "workoutStyle",
        label: "Movement",
        options: ["30-min zone-2 cardio + mobility", "45-min strength training", "20-min outdoor walk & breathwork"],
        defaultOption: "30-min zone-2 cardio + mobility",
      },
    ],
  },
  {
    id: "auto-weekend-curiosity",
    title: "Weekend Deep Reading & Curiosity Digest",
    category: "Life",
    subCategory: "Learning & Culture",
    description:
      "Curates long-form essays, biographies, history deep dives, and mental models tailored to your Living Wiki interests.",
    icon: "☕",
    defaultSchedule: "weekly",
    defaultTime: "09:30",
    defaultTimezone: "America/Los_Angeles",
    promptTemplate:
      "Curate a weekend reading syllabus exploring {subject} featuring {readingFormat} and 3 synthesis questions to ponder.",
    chips: [
      {
        id: "subject",
        label: "Subject",
        options: ["history of technology &great inventors", "philosophy, stoicism & decision-making", "complex systems, biology & economics"],
        defaultOption: "history of technology &great inventors",
      },
      {
        id: "readingFormat",
        label: "Selection",
        options: ["3 timeless essays + 1 book synthesis", "a deep biographical case study", "cross-disciplinary mental models"],
        defaultOption: "3 timeless essays + 1 book synthesis",
      },
    ],
  },
];

export function compileAutomationPrompt(
  template: string,
  chips: Record<string, string>
): string {
  let compiled = template;
  for (const [key, value] of Object.entries(chips)) {
    compiled = compiled.replaceAll(`{${key}}`, value);
  }
  return compiled.trim();
}

export const PLATFORM_SKILLS: SkillDefinition[] = [
  {
    id: "web-search",
    name: "Deep Web & Real-Time Search",
    provider: "Teamily Native",
    description: "Queries live web sources, news feeds, and documentation with inline source verification.",
    category: "Research",
    enabledByDefault: true,
    icon: "🌐",
  },
  {
    id: "living-wiki",
    name: "Living Wiki Memory Synthesizer",
    provider: "Teamily Native",
    description: "Reads and updates structured Living Wiki pages, knowledge graph nodes, and action items.",
    category: "Memory",
    enabledByDefault: true,
    icon: "🧠",
  },
  {
    id: "artifact-builder",
    name: "Interactive Artifact & Cloud Doc Studio",
    provider: "Teamily Native",
    description: "Generates interactive HTML previews, SVG diagrams, data tables, and TipTap cloud documents.",
    category: "Creation",
    enabledByDefault: true,
    icon: "✨",
  },
  {
    id: "swarm-router",
    name: "Multi-Agent Swarm Router",
    provider: "Teamily Native",
    description: "Delegates sub-tasks across specialist AI agents in parallel and synthesizes consensus.",
    category: "Productivity",
    enabledByDefault: true,
    icon: "🐝",
  },
  {
    id: "code-interpreter",
    name: "Sandboxed Code & Data Analyzer",
    provider: "Teamily Runtime",
    description: "Executes TypeScript/Python calculations, data transformations, and schema validations.",
    category: "Developer",
    enabledByDefault: true,
    icon: "💻",
  },
  {
    id: "decision-matrix",
    name: "First-Principles Decision Matrix",
    provider: "Strategy Suite",
    description: "Scores strategic options across weighted criteria, second-order risks, and expected value.",
    category: "Productivity",
    enabledByDefault: true,
    icon: "⚖️",
  },
  {
    id: "financial-modeling",
    name: "SaaS & Runway Financial Modeler",
    provider: "Strategy Suite",
    description: "Models ARR scenarios, burn multiples, unit economics, and cohort retention tables.",
    category: "Productivity",
    enabledByDefault: true,
    icon: "📐",
  },
  {
    id: "copywriting-studio",
    name: "Multi-Channel Narrative & Copy Studio",
    provider: "Creator Suite",
    description: "Adapts core product narratives into landing pages, launch threads, and visual story cards.",
    category: "Creation",
    enabledByDefault: true,
    icon: "🖋️",
  },
  {
    id: "academic-digest",
    name: "ArXiv & Primary Filing Synthesizer",
    provider: "Research Suite",
    description: "Extracts methodology, benchmarks, and citations from technical papers and SEC filings.",
    category: "Research",
    enabledByDefault: true,
    icon: "🔬",
  },
  {
    id: "security-audit",
    name: "OWASP & Auth Boundary Auditor",
    provider: "Engineering Suite",
    description: "Reviews auth flows, RBAC guards, SQL queries, and API routes for security vulnerabilities.",
    category: "Developer",
    enabledByDefault: true,
    icon: "🛡️",
  },
];

export const PLATFORM_CONNECTORS: ConnectorDefinition[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    category: "Workspace",
    description: "Sync daily schedule, prep meeting dossiers, and schedule deep-work blocks.",
    authType: "OAuth 2.0",
    icon: "📅",
    color: "#2563eb",
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "Communication",
    description: "Triage priority threads, draft executive replies, and extract follow-up commitments.",
    authType: "OAuth 2.0",
    icon: "✉️",
    color: "#dc2626",
  },
  {
    id: "notion",
    name: "Notion",
    category: "Knowledge",
    description: "Bi-directional sync between Notion databases and your Teamily Living Wiki.",
    authType: "OAuth 2.0",
    icon: "📓",
    color: "#111827",
  },
  {
    id: "github",
    name: "GitHub",
    category: "Engineering",
    description: "Track pull requests, commits, issues, and architectural diffs across repositories.",
    authType: "OAuth 2.0",
    icon: "🐙",
    color: "#1f2937",
  },
  {
    id: "slack",
    name: "Slack",
    category: "Communication",
    description: "Deploy Teamily agents into Slack channels and receive automated briefing digests.",
    authType: "OAuth 2.0",
    icon: "💬",
    color: "#7c3aed",
  },
  {
    id: "feishu",
    name: "Feishu / Lark",
    category: "Workspace",
    description: "Connect Feishu docs, bots, and group chats to your multi-agent workspace.",
    authType: "OAuth 2.0",
    icon: "🐦",
    color: "#0284c7",
  },
  {
    id: "linear",
    name: "Linear",
    category: "Engineering",
    description: "Turn chat decisions and Living Wiki next actions directly into Linear issues.",
    authType: "OAuth 2.0",
    icon: "⚡",
    color: "#4f46e5",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    category: "Knowledge",
    description: "Index spreadsheets, PDFs, and presentations into your workspace memory.",
    authType: "OAuth 2.0",
    icon: "📁",
    color: "#059669",
  },
  {
    id: "x-twitter",
    name: "X (Twitter)",
    category: "Consumer",
    description: "Monitor real-time industry signals and publish creator threads.",
    authType: "OAuth 2.0",
    icon: "𝕏",
    color: "#0f172a",
  },
  {
    id: "xiaohongshu",
    name: "Xiaohongshu (RED)",
    category: "Consumer",
    description: "Research consumer trends and format visual story cards for creator growth.",
    authType: "API Token",
    icon: "📕",
    color: "#e11d48",
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPricePerMonth: 0,
    tagline: "Experience your Personal Agent, Living Wiki, and starter multi-agent chats.",
    creditsPerMonth: 500,
    dailyRefreshCredits: 200,
    features: [
      "500 monthly base credits + 200 daily refresh credits",
      "Personal Agent with Auto & Instant modes",
      "Access to 10 Official Specialist Agents",
      "Up to 2 active scheduled Automations",
      "Living Wiki & Cloud Document Artifacts",
      "Community Feed & Agent Team discovery",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    monthlyPrice: 20,
    annualPricePerMonth: 16,
    tagline: "For builders and creators running daily automations and multi-agent rooms.",
    creditsPerMonth: 2500,
    dailyRefreshCredits: 300,
    features: [
      "2,500 monthly credits + 300 daily refresh credits",
      "Full Agentic mode with deep reasoning traces",
      "Unlimited custom Agents & Multi-Agent Groups",
      "Up to 15 active Work & Life Automations",
      "All 10 Workspace & Knowledge Connectors",
      "Priority cloud runtime execution",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 40,
    annualPricePerMonth: 32,
    tagline: "Power-user orchestration with high-concurrency agent teams and deep memory.",
    highlighted: true,
    badge: "Most Popular",
    creditsPerMonth: 6000,
    dailyRefreshCredits: 500,
    features: [
      "6,000 monthly credits + 500 daily refresh credits",
      "Parallel Swarm execution across up to 8 agents per room",
      "Unlimited scheduled Automations & webhook triggers",
      "Full Living Wiki Knowledge Graph & automatic memory synthesis",
      "Custom Skill packages & Desktop Local Runtime bridge",
      "Creator Center monetization & referral rewards",
    ],
  },
  {
    id: "max",
    name: "Max",
    monthlyPrice: 200,
    annualPricePerMonth: 160,
    tagline: "Unrestricted autonomous scale for executive teams and heavy research workflows.",
    badge: "Enterprise Scale",
    creditsPerMonth: 35000,
    dailyRefreshCredits: 1500,
    features: [
      "35,000 monthly credits + 1,500 daily refresh credits",
      "Dedicated high-throughput Swarm compute cluster",
      "Admin RBAC governance, single-use Invite Codes & Audit Logs",
      "Unlimited Living Wiki storage & version history",
      "Custom MCP / API connectors & enterprise security controls",
      "24/7 priority engineering support",
    ],
  },
];

export const FIRST_WEEK_ONBOARDING_TASKS = [
  {
    dayNumber: 1,
    title: "Meet Your Personal Agent & Define Your Role",
    description:
      "Send your first prompt in Chat and tell your Personal Agent about your current projects and goals.",
  },
  {
    dayNumber: 2,
    title: "Assemble a Multi-Agent Group Room",
    description:
      "Create a New Group combining 2+ specialist agents (e.g., Ray, Steve, and Marcus) to debate a decision.",
  },
  {
    dayNumber: 3,
    title: "Activate a Recurring Morning Automation",
    description:
      "Open Discover -> Automations and schedule a Daily Morning Executive Briefing or Competitor Radar.",
  },
  {
    dayNumber: 4,
    title: "Build Your Living Wiki Memory",
    description:
      "Create or edit a page in Memory -> Wiki so your agents retain persistent project context.",
  },
  {
    dayNumber: 5,
    title: "Generate an Interactive Artifact or Cloud Doc",
    description:
      "Create a rich TipTap document or interactive HTML dashboard inside Artifacts.",
  },
  {
    dayNumber: 6,
    title: "Connect Your Workspace Tools",
    description:
      "Enable Google Calendar, GitHub, or Notion in Settings -> Connectors.",
  },
  {
    dayNumber: 7,
    title: "Share a Workflow or Invite a Teammate",
    description:
      "Publish a showcase post to the Community Feed or invite a collaborator to your workspace.",
  },
];

export const SHOWCASE_COMMUNITY_POSTS = [
  {
    id: "showcase-1",
    title: "How I Replaced 4 Morning Newsletters with a 3-Agent Briefing Room",
    summary:
      "Aria scouts primary sources at 8:00 AM, Ray filters for macro signal, and Naval distills it into 5 high-leverage bullets saved straight to my Living Wiki.",
    category: "Automations",
    authorName: "Teamily Official Showcase",
    authorHandle: "@teamily",
    authorEmoji: "🌿",
    likesCount: 142,
    commentsCount: 28,
    tags: ["Automation", "Living Wiki", "Multi-Agent"],
    promptSnippet:
      "Every morning at 08:30, scan AI & SaaS releases, cross-reference with our Living Wiki roadmap, and post a 5-bullet executive brief.",
    content: `### Why Single-Agent Prompts Fall Short for Daily Briefings

When you ask a single LLM for a morning briefing, you get generic summaries. By pairing **Aria (Deep Research Lead)** with **Ray (Macro Principles)** and **Teamily Agent**, each agent critiques and filters the output before it ever hits your inbox.

#### Workflow Architecture
1. **08:15 AM — Aria** runs a live web & ArXiv sweep across autonomous AI workspaces and developer tools.
2. **08:20 AM — Ray** scores each development against our Q2 strategic priorities in the Living Wiki.
3. **08:30 AM — Teamily Agent** posts the final 3-minute briefing in Chat and appends action items to **Memory -> Next Actions**.`,
  },
  {
    id: "showcase-2",
    title: "Building a First-Principles Product Spec in 12 Minutes with Steve, Elon & Marcus",
    summary:
      "We ran our Q3 onboarding redesign through the Product Launch War Room + Autonomous Engineering Squad. We deleted 60% of the form fields and generated a working HTML artifact.",
    category: "Agent Teams",
    authorName: "Teamily Official Showcase",
    authorHandle: "@teamily",
    authorEmoji: "🚀",
    likesCount: 198,
    commentsCount: 41,
    tags: ["Product Craft", "Engineering", "Artifacts"],
    promptSnippet:
      "@Steve @Elon @Marcus Critique our current 6-step onboarding flow, delete every non-essential field, and generate an interactive HTML prototype artifact.",
    content: `### Multi-Perspective Product Critique

Instead of sequential handoffs between PM, Design, and Engineering, running a **Multi-Agent Group** lets perspectives collide constructively in real time:

- **Elon** challenged why steps 3 and 4 existed at all and proposed deriving workspace defaults automatically.
- **Steve** rewrote the hero microcopy to focus on immediate creative momentum.
- **Marcus** generated a self-contained HTML/CSS prototype artifact and Prisma schema migration in the same thread.`,
  },
  {
    id: "showcase-3",
    title: "Living Wiki Pattern: Turning Every Meeting & Chat into Compounding Team Memory",
    summary:
      "A look at how Teamily's Knowledge Graph connects Personal Memory, Project Wiki pages, and automated Next Actions so context is never lost across sessions.",
    category: "Living Wiki",
    authorName: "Teamily Official Showcase",
    authorHandle: "@teamily",
    authorEmoji: "🧠",
    likesCount: 116,
    commentsCount: 19,
    tags: ["Memory", "Knowledge Graph", "Productivity"],
    promptSnippet:
      "Review our latest architecture thread, update the 'Core Platform Architecture' Wiki page, and extract 3 P0 Next Actions.",
    content: `### The 3 Layers of Teamily Memory

1. **Knowledge Graph Overview**: Visualizes how your core identity, active projects, specialist agents, and documents link together.
2. **Living Wiki Pages**: Markdown/TipTap documents that both humans and agents can read and update during conversations.
3. **Next Actions & Meetings**: Structured commitments extracted automatically from your chats and scheduled briefings.`,
  },
];
