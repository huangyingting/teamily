"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SettingsLayout } from "@/components/SettingsLayout";
import {
  PRICING_TIERS,
  PLATFORM_SKILLS,
  PLATFORM_CONNECTORS,
} from "@/lib/catalog";
import {
  Check,
  Sparkles,
  Plug,
  Puzzle,
  Terminal,
  Radio,
  BarChart3,
  Share2,
  Plus,
  KeyRound,
  Cpu,
  Copy,
  Laptop,
  DollarSign,
} from "lucide-react";

interface IntegrationItem {
  id: string;
  category: string;
  key: string;
  name: string;
  isEnabled: boolean;
}

const MESSAGING_CHANNELS = [
  {
    id: "wechat",
    name: "WeChat",
    icon: "💬",
    description: "Receive messages via WeChat clawbot",
  },
  {
    id: "imessage",
    name: "iMessage",
    icon: "🍎",
    description: "Send and receive messages via macOS iMessage (requires Desktop App)",
  },
  {
    id: "slack-channel",
    name: "Slack",
    icon: "💼",
    description: "Connect to your Slack workspace",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "📱",
    description: "Chat via WhatsApp using QR code login",
  },
];

export default function DynamicSettingsSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params?.section || "subscription";

  const [userPlan, setUserPlan] = useState("Free");
  const [userHandle, setUserHandle] = useState("workspace");
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [usage, setUsage] = useState({
    messageCount: 0,
    automationCount: 0,
    artifactCount: 0,
    wikiCount: 0,
  });

  // Skill Configuration API Key Modal state
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [keyEnvName, setKeyEnvName] = useState("");
  const [keySecretValue, setKeySecretValue] = useState("");

  // Connectors MCP Server Modal state
  const [showAddMcpModal, setShowAddMcpModal] = useState(false);
  const [mcpName, setMcpName] = useState("");
  const [mcpUrl, setMcpUrl] = useState("");

  // Runtimes state
  const [detectedRuntimes, setDetectedRuntimes] = useState<Record<string, string>>({});
  const [remoteHostInput, setRemoteHostInput] = useState("");
  const [remoteConnected, setRemoteConnected] = useState(false);

  // Affiliate & Creator Center state
  const [copiedAffiliate, setCopiedAffiliate] = useState(false);
  const [withdrawNotice, setWithdrawNotice] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, [section]);

  async function loadSettings() {
    const res = await fetch("/api/settings");
    if (!res.ok) return;
    const data = await res.json();
    if (data.user) {
      setUserPlan(data.user.plan);
      if (data.user.handle) setUserHandle(data.user.handle);
    }
    if (data.integrations) setIntegrations(data.integrations);
    if (data.usage) setUsage(data.usage);
  }

  async function handleSelectPlan(planName: string) {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planName }),
    });
    if (res.ok) {
      setUserPlan(planName);
    }
  }

  async function handleToggleIntegration(
    category: string,
    key: string,
    name: string,
    currentlyEnabled: boolean
  ) {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        integrationCategory: category,
        integrationKey: key,
        integrationName: name,
        isEnabled: !currentlyEnabled,
      }),
    });
    await loadSettings();
  }

  async function handleAddSkillKey(e: React.FormEvent) {
    e.preventDefault();
    if (!keyEnvName.trim() || !keySecretValue.trim()) return;
    const masked = `${keyEnvName.trim().toUpperCase()} (${keySecretValue.trim().slice(0, 3)}•••)`;
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        integrationCategory: "SKILL_API_KEY",
        integrationKey: keyEnvName.trim().toUpperCase(),
        integrationName: masked,
        isEnabled: true,
      }),
    });
    setKeyEnvName("");
    setKeySecretValue("");
    setShowAddKeyModal(false);
    await loadSettings();
  }

  async function handleAddMcpServer(e: React.FormEvent) {
    e.preventDefault();
    if (!mcpName.trim() || !mcpUrl.trim()) return;
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        integrationCategory: "MCP_SERVER",
        integrationKey: mcpName.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
        integrationName: `${mcpName.trim()} (${mcpUrl.trim()})`,
        isEnabled: true,
      }),
    });
    setMcpName("");
    setMcpUrl("");
    setShowAddMcpModal(false);
    await loadSettings();
  }

  function isEnabled(category: string, key: string, defaultVal = false) {
    const found = integrations.find(
      (i) => i.category === category && i.key === key
    );
    return found ? found.isEnabled : defaultVal;
  }

  const skillKeys = integrations.filter((i) => i.category === "SKILL_API_KEY" && i.isEnabled);
  const customMcpServers = integrations.filter((i) => i.category === "MCP_SERVER" && i.isEnabled);
  const referralCode = userHandle.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6).padEnd(6, "8");
  const referralUrl = `https://teamily.ai/i/${referralCode}`;

  return (
    <SettingsLayout>
      {/* 1. SUBSCRIPTION */}
      {section === "subscription" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold">Subscription & Plan</h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Current Workspace Tier: <strong className="text-[#087c45]">{userPlan}</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRICING_TIERS.map((tier) => {
              const current = userPlan.toLowerCase() === tier.name.toLowerCase();
              return (
                <div
                  key={tier.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between ${
                    current
                      ? "border-[#087c45] bg-[#ddf3e5]/30"
                      : "border-teamily bg-teamily-surface"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-extrabold">{tier.name}</h2>
                      <span className="text-xl font-black">${tier.monthlyPrice}/mo</span>
                    </div>
                    <p className="mt-1 text-xs text-teamily-secondary">{tier.tagline}</p>
                    <ul className="mt-4 space-y-1.5 text-xs">
                      {tier.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-[#087c45] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    disabled={current}
                    onClick={() => handleSelectPlan(tier.name)}
                    className={`mt-5 w-full rounded-xl py-2 text-xs font-bold ${
                      current
                        ? "bg-teamily-subtle text-teamily-secondary"
                        : "bg-[#087c45] text-white hover:bg-[#066a3b]"
                    }`}
                  >
                    {current ? "Current Active Plan" : `Switch to ${tier.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. USAGE */}
      {section === "usage" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#087c45]" /> Workspace Usage Analytics
            </h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Real-time activity across your conversations, automations, artifacts, and Living Wiki
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Chat Messages", value: usage.messageCount },
              { label: "Scheduled Automations", value: usage.automationCount },
              { label: "Cloud Docs & Artifacts", value: usage.artifactCount },
              { label: "Living Wiki Pages", value: usage.wikiCount },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-teamily bg-teamily-surface p-5"
              >
                <p className="text-xs text-teamily-secondary font-semibold">{stat.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-[#087c45]">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SKILL CONFIGURATION */}
      {section === "skill-configuration" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold flex items-center gap-2">
                <Puzzle className="h-6 w-6 text-[#087c45]" /> Skill Configuration
              </h1>
              <p className="text-xs text-teamily-secondary mt-1">
                API keys for skills that require external services. Keys are encrypted at rest and injected into your sandbox automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddKeyModal(true)}
              data-testid="add-skill-key-button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#066a3b] shrink-0"
            >
              <Plus className="h-4 w-4" /> Add Key
            </button>
          </div>

          {showAddKeyModal && (
            <form
              onSubmit={handleAddSkillKey}
              className="rounded-2xl border border-[#087c45] bg-teamily-surface p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[#087c45]" /> Add Encrypted Skill API Key
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddKeyModal(false)}
                  className="text-xs text-teamily-secondary hover:underline"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Environment Variable Name</label>
                  <input
                    type="text"
                    required
                    value={keyEnvName}
                    onChange={(e) => setKeyEnvName(e.target.value)}
                    placeholder="e.g. SERPER_API_KEY"
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Secret API Key</label>
                  <input
                    type="password"
                    required
                    value={keySecretValue}
                    onChange={(e) => setKeySecretValue(e.target.value)}
                    placeholder="sk-..."
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white"
              >
                Save Encrypted Key
              </button>
            </form>
          )}

          {/* Encrypted API keys list */}
          <div className="rounded-2xl border border-teamily bg-teamily-surface p-5">
            <h2 className="text-xs font-bold uppercase text-teamily-secondary mb-3">
              Configured Skill API Keys ({skillKeys.length})
            </h2>
            {skillKeys.length === 0 ? (
              <p className="text-xs text-teamily-secondary">
                No API keys configured yet. Click &ldquo;Add Key&rdquo; to inject external skill credentials into your sandbox.
              </p>
            ) : (
              <div className="space-y-2">
                {skillKeys.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between rounded-xl border border-teamily bg-teamily-main px-4 py-2.5 text-xs"
                  >
                    <span className="font-mono font-bold">{k.name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleIntegration("SKILL_API_KEY", k.key, k.name, true)}
                      className="text-[#ff5260] font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORM_SKILLS.map((skill) => {
              const enabled = isEnabled("SKILL", skill.id, skill.enabledByDefault);
              return (
                <div
                  key={skill.id}
                  className="rounded-2xl border border-teamily bg-teamily-surface p-5 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{skill.icon}</span>
                      <h3 className="font-bold text-sm">{skill.name}</h3>
                    </div>
                    <p className="mt-1 text-xs text-teamily-secondary">{skill.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleIntegration("SKILL", skill.id, skill.name, enabled)
                    }
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold ${
                      enabled
                        ? "bg-[#087c45] text-white"
                        : "border border-teamily bg-teamily-main text-teamily-secondary"
                    }`}
                  >
                    {enabled ? "Enabled" : "Enable"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CONNECTORS */}
      {section === "connectors" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold flex items-center gap-2">
                <Plug className="h-6 w-6 text-[#087c45]" /> Connectors
              </h1>
              <p className="text-xs text-teamily-secondary mt-1">
                Give your Agent access to external services. Notice: Make sure you trust a connector before adding it.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddMcpModal(true)}
              data-testid="add-mcp-server-button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#066a3b] shrink-0"
            >
              <Plus className="h-4 w-4" /> Add MCP server
            </button>
          </div>

          {showAddMcpModal && (
            <form
              onSubmit={handleAddMcpServer}
              className="rounded-2xl border border-[#087c45] bg-teamily-surface p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">Add Custom MCP Server</h2>
                <button
                  type="button"
                  onClick={() => setShowAddMcpModal(false)}
                  className="text-xs text-teamily-secondary hover:underline"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Server Name</label>
                  <input
                    type="text"
                    required
                    value={mcpName}
                    onChange={(e) => setMcpName(e.target.value)}
                    placeholder="e.g. Postgres Read-Only MCP"
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">SSE / HTTP Endpoint URL</label>
                  <input
                    type="text"
                    required
                    value={mcpUrl}
                    onChange={(e) => setMcpUrl(e.target.value)}
                    placeholder="https://mcp.internal.example/sse"
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white"
              >
                Register MCP Server
              </button>
            </form>
          )}

          {customMcpServers.length > 0 && (
            <div className="rounded-2xl border border-teamily bg-teamily-surface p-4 space-y-2">
              <p className="text-xs font-bold text-[#087c45]">Custom MCP Servers</p>
              {customMcpServers.map((mcp) => (
                <div
                  key={mcp.id}
                  className="flex items-center justify-between rounded-xl border border-teamily bg-teamily-main px-3.5 py-2 text-xs"
                >
                  <span className="font-semibold">{mcp.name}</span>
                  <span className="rounded-md bg-[#ddf3e5] px-2 py-0.5 text-[10px] font-bold text-[#087c45]">
                    Connected ✓
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORM_CONNECTORS.map((conn) => {
              const enabled = isEnabled("CONNECTOR", conn.id, false);
              return (
                <div
                  key={conn.id}
                  className="rounded-2xl border border-teamily bg-teamily-surface p-5 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{conn.icon}</span>
                      <h3 className="font-bold text-sm">{conn.name}</h3>
                      <span className="rounded-md bg-teamily-subtle px-2 py-0.5 text-[10px] font-semibold">
                        {conn.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-teamily-secondary">{conn.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleIntegration("CONNECTOR", conn.id, conn.name, enabled)
                    }
                    className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold ${
                      enabled
                        ? "bg-[#ddf3e5] text-[#087c45]"
                        : "bg-[#087c45] text-white"
                    }`}
                  >
                    {enabled ? "Connected ✓" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. CHANNELS */}
      {section === "channels" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Radio className="h-6 w-6 text-[#087c45]" /> Channels
            </h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Receive agent replies and notifications through your favorite messaging apps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MESSAGING_CHANNELS.map((ch) => {
              const enabled = isEnabled("CHANNEL", ch.id, false);
              return (
                <div
                  key={ch.id}
                  className="rounded-2xl border border-teamily bg-teamily-surface p-5 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ch.icon}</span>
                      <h3 className="font-bold text-sm">{ch.name}</h3>
                    </div>
                    <p className="mt-1 text-xs text-teamily-secondary">{ch.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleIntegration("CHANNEL", ch.id, ch.name, enabled)}
                    className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold ${
                      enabled
                        ? "bg-[#ddf3e5] text-[#087c45]"
                        : "bg-[#087c45] text-white"
                    }`}
                  >
                    {enabled ? "Connected ✓" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. AGENT ACCESS */}
      {section === "agent-access" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold">Agent Access</h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Grant external AI agents (such as Claude Code, OpenClaw, Codex) access to your Teamily account — send messages, manage groups, read files, and collaborate seamlessly.
            </p>
          </div>

          <div className="rounded-3xl border border-teamily bg-teamily-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold">Agent API</h2>
                <p className="text-xs text-teamily-secondary mt-0.5">
                  REST & MCP bridge endpoint for external autonomous coding agents
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggleIntegration(
                    "AGENT_API",
                    "external-agent-api",
                    "External Agent API Bridge",
                    isEnabled("AGENT_API", "external-agent-api", true)
                  )
                }
                className={`rounded-xl px-4 py-2 text-xs font-bold ${
                  isEnabled("AGENT_API", "external-agent-api", true)
                    ? "bg-[#087c45] text-white"
                    : "border border-teamily bg-teamily-main text-teamily-secondary"
                }`}
              >
                {isEnabled("AGENT_API", "external-agent-api", true) ? "API Enabled" : "Enable API"}
              </button>
            </div>

            <div className="rounded-2xl border border-teamily bg-teamily-main p-4 text-xs space-y-2">
              <p className="font-bold text-teamily-secondary">Authorized AI Clients</p>
              {["Claude Code (Anthropic CLI)", "OpenAI Codex CLI", "OpenClaw Desktop Bridge"].map(
                (clientName) => (
                  <div
                    key={clientName}
                    className="flex items-center justify-between py-1.5 border-b border-teamily last:border-b-0"
                  >
                    <span className="font-semibold">{clientName}</span>
                    <span className="rounded-md bg-[#ddf3e5] px-2.5 py-0.5 text-[10px] font-bold text-[#087c45]">
                      Ready to Authorize
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. RUNTIMES */}
      {section === "runtimes" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Terminal className="h-6 w-6 text-[#087c45]" /> Runtimes
            </h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Where your agents run and what tools they can reach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-[#087c45] bg-teamily-surface p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold">Teamily Cloud</h2>
                <span className="rounded-full bg-[#ddf3e5] px-2.5 py-0.5 text-[10px] font-bold text-[#087c45]">
                  Managed
                </span>
              </div>
              <p className="text-xs text-teamily-secondary leading-relaxed">
                Runs in the cloud. Always on, zero setup. Best for quick tasks, scheduled jobs, and when your computer is offline.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#ddf3e5] px-3 py-1.5 text-xs font-bold text-[#087c45]">
                  Connected
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-teamily bg-teamily-surface p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold">Teamily Computer</h2>
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-teamily-secondary leading-relaxed">
                Turn your computer into a 24/7 agent workstation. Full access to local files, terminal, browser, and installed tools.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <Link
                  href="/download"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-3.5 py-1.5 text-xs font-bold text-white"
                >
                  <Laptop className="h-3.5 w-3.5" /> Download App
                </Link>
                <button
                  type="button"
                  onClick={() => setRemoteConnected(!remoteConnected)}
                  className="rounded-xl border border-teamily bg-teamily-main px-3 py-1.5 text-xs font-bold hover:bg-teamily-subtle"
                >
                  {remoteConnected ? "Remote Machine Connected ✓" : "Connect remote machine"}
                </button>
              </div>
              {remoteConnected && (
                <input
                  type="text"
                  value={remoteHostInput}
                  onChange={(e) => setRemoteHostInput(e.target.value)}
                  placeholder="ssh://dev@workstation.local:22"
                  className="mt-2 w-full rounded-xl border border-teamily bg-teamily-main px-3 py-1.5 text-xs"
                />
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-teamily bg-teamily-surface p-6 space-y-4">
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#087c45]" /> Local AI
              </h2>
              <p className="text-xs text-teamily-secondary mt-0.5">
                Detect AI coding tools installed on this machine and let Teamily dispatch tasks to them directly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {[
                {
                  id: "claude-code",
                  name: "Claude Code",
                  desc: "Anthropic's agentic coding CLI",
                },
                {
                  id: "codex",
                  name: "Codex",
                  desc: "OpenAI's local coding agent",
                },
              ].map((tool) => (
                <div
                  key={tool.id}
                  className="rounded-2xl border border-teamily bg-teamily-main p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-sm">{tool.name}</h3>
                    <p className="text-teamily-secondary mt-0.5">{tool.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDetectedRuntimes((prev) => ({
                        ...prev,
                        [tool.id]: "Detected ✓",
                      }))
                    }
                    className="rounded-xl border border-teamily bg-teamily-surface px-3.5 py-1.5 font-bold hover:border-[#087c45]"
                  >
                    {detectedRuntimes[tool.id] || "Detect"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. CREATOR CENTER */}
      {section === "creator-center" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#087c45]" /> Create to Earn
            </h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Earn real cash every time someone hires your agent or uses your skill
            </p>
          </div>

          <div className="rounded-3xl border border-[#087c45]/30 bg-gradient-to-r from-[#ddf3e5]/60 via-teamily-surface to-teamily-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="rounded-md bg-[#087c45] px-2 py-0.5 text-[10px] font-bold text-white">
                $CASH
              </span>
              <p className="mt-2 text-3xl font-black text-[#087c45]">$0.00</p>
              <p className="text-xs text-teamily-secondary">
                Available Creator Payout Balance (No minimum threshold)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setWithdrawNotice("Creator payout wallet verified. Minimum $0.01 balance required to withdraw.")
                }
                className="rounded-xl bg-[#087c45] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#066a3b]"
              >
                <DollarSign className="inline h-3.5 w-3.5 mr-1" />
                Withdraw
              </button>
              <Link
                href="/discover"
                className="rounded-xl border border-teamily bg-teamily-main px-4 py-2.5 text-xs font-bold hover:bg-teamily-subtle"
              >
                Publish Agent or Skill
              </Link>
            </div>
          </div>

          {withdrawNotice && (
            <div className="rounded-xl bg-[#ddf3e5] px-4 py-2.5 text-xs font-bold text-[#087c45]">
              {withdrawNotice}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {[
              {
                step: "1. Create & Publish",
                desc: "Build a specialized agent or reusable skill and publish it to the Teamily community.",
              },
              {
                step: "2. Get Hired & Used",
                desc: "Every time a user chats with your agent or runs your skill, you earn cash rewards based on usage.",
              },
              {
                step: "3. Withdraw Cash",
                desc: "Cash out your earnings anytime. No minimum threshold — your creativity pays off from day one.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-teamily bg-teamily-surface p-5"
              >
                <h3 className="font-bold text-sm text-[#087c45]">{item.step}</h3>
                <p className="mt-1.5 text-teamily-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. AFFILIATE */}
      {section === "affiliate" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Share2 className="h-6 w-6 text-[#087c45]" /> Affiliate Program
            </h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Earn 25% commission on every payment from users you refer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-2xl border border-teamily bg-teamily-surface p-5">
              <p className="text-teamily-secondary font-semibold">Commission Rate</p>
              <p className="mt-2 text-3xl font-black text-[#087c45]">25%</p>
            </div>
            <div className="rounded-2xl border border-teamily bg-teamily-surface p-5">
              <p className="text-teamily-secondary font-semibold">Referred Purchases</p>
              <p className="mt-2 text-3xl font-black">0</p>
            </div>
            <div className="rounded-2xl border border-teamily bg-teamily-surface p-5 flex items-center justify-between">
              <div>
                <p className="text-teamily-secondary font-semibold">Withdrawable</p>
                <p className="mt-2 text-3xl font-black text-[#087c45]">$0.00</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setWithdrawNotice("Affiliate payout ready once your first referred user subscribes.")
                }
                className="rounded-xl bg-[#087c45] px-3.5 py-2 text-xs font-bold text-white"
              >
                Withdraw
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-teamily bg-teamily-surface p-6 space-y-3">
            <h2 className="text-sm font-extrabold">Your Referral Link</h2>
            <p className="text-xs text-teamily-secondary">
              Share your link with friends, followers, or communities. When someone signs up and purchases any plan or credit pack, you earn 25% of every payment.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                data-testid="affiliate-referral-link"
                className="flex-1 rounded-xl border border-teamily bg-teamily-main px-3.5 py-2 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(referralUrl);
                  setCopiedAffiliate(true);
                  setTimeout(() => setCopiedAffiliate(false), 2000);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedAffiliate ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}
