"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import {
  AutomationTemplate,
  compileAutomationPrompt,
} from "@/lib/catalog";
import {
  Compass,
  Users,
  Zap,
  Sparkles,
  Plus,
  MessageSquare,
  Heart,
  Play,
  Trash2,
  X,
  Check,
  Clock,
} from "lucide-react";

interface PostItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  likesCount: number;
  commentsCount: number;
  authorName: string;
  authorHandle: string;
  authorEmoji?: string;
}

interface AgentItem {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: string;
  description: string;
  avatarEmoji: string;
  avatarBg: string;
}

interface AgentTeamItem {
  id: string;
  name: string;
  category: string;
  description: string;
  leadAgent: string;
  members: { name: string; role: string; emoji: string }[];
  badge: string;
}

interface UserAutomation {
  id: string;
  title: string;
  category: string;
  scheduleType: string;
  scheduleTime: string;
  compiledPrompt: string;
  isActive: boolean;
  lastRunAt?: string | null;
}

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") === "agents" ? "agents" : "feed";
  const initialSection =
    (searchParams.get("section") as "agents" | "teams" | "automations") || "agents";

  const [mainTab, setMainTab] = useState<"feed" | "agents">(initialTab);
  const [subTab, setSubTab] = useState<"agents" | "teams" | "automations">(initialSection);
  const [feedSourceTab, setFeedSourceTab] = useState<"Feeds" | "Following">("Feeds");
  const [feedCategory, setFeedCategory] = useState("All");
  const [autoCategory, setAutoCategory] = useState<"All" | "Work" | "Life">("All");

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [agentTeams, setAgentTeams] = useState<AgentTeamItem[]>([]);
  const [automations, setAutomations] = useState<UserAutomation[]>([]);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);

  // Publish Post Modal
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("Agent Teams");
  const [postContent, setPostContent] = useState("");

  // Automation Composer Modal (with clickable inline green chips!)
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  const [chipValues, setChipValues] = useState<Record<string, string>>({});
  const [scheduleType, setScheduleType] = useState<"daily" | "weekly" | "monthly" | "once">("daily");
  const [scheduleTime, setScheduleTime] = useState("08:30");
  const [savingAuto, setSavingAuto] = useState(false);

  useEffect(() => {
    loadDiscoverData();
  }, []);

  async function loadDiscoverData() {
    const [postsRes, agentsRes, autoRes] = await Promise.all([
      fetch("/api/posts"),
      fetch("/api/agents"),
      fetch("/api/automations"),
    ]);
    if (postsRes.ok) {
      const d = await postsRes.json();
      setPosts(d.posts || []);
    }
    if (agentsRes.ok) {
      const d = await agentsRes.json();
      setAgents(d.agents || []);
      setAgentTeams(d.agentTeams || []);
    }
    if (autoRes.ok) {
      const d = await autoRes.json();
      setAutomations(d.automations || []);
      setTemplates(d.templates || []);
    }
  }

  function openAutomationComposer(tpl: AutomationTemplate) {
    const defaults: Record<string, string> = {};
    tpl.chips.forEach((c) => {
      defaults[c.id] = c.defaultOption;
    });
    setSelectedTemplate(tpl);
    setChipValues(defaults);
    setScheduleType(tpl.defaultSchedule);
    setScheduleTime(tpl.defaultTime);
  }

  function cycleChipOption(chipId: string, options: string[]) {
    const current = chipValues[chipId] || options[0];
    const nextIdx = (options.indexOf(current) + 1) % options.length;
    setChipValues((prev) => ({
      ...prev,
      [chipId]: options[nextIdx],
    }));
  }

  async function handleSaveAutomation() {
    if (!selectedTemplate) return;
    setSavingAuto(true);
    try {
      const compiledPrompt = compileAutomationPrompt(
        selectedTemplate.promptTemplate,
        chipValues
      );
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTemplate.title,
          category: selectedTemplate.category,
          scheduleType,
          scheduleTime,
          promptTemplate: selectedTemplate.promptTemplate,
          chips: chipValues,
          compiledPrompt,
        }),
      });
      if (res.ok) {
        setSelectedTemplate(null);
        await loadDiscoverData();
      }
    } finally {
      setSavingAuto(false);
    }
  }

  async function handleTriggerAutomation(id: string) {
    await fetch(`/api/automations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triggerNow: true }),
    });
    await loadDiscoverData();
  }

  async function handleDeleteAutomation(id: string) {
    await fetch(`/api/automations/${id}`, { method: "DELETE" });
    await loadDiscoverData();
  }

  async function handleStartAgentChat(agent: AgentItem) {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: agent.name,
        type: "DIRECT_AGENT",
        agentIds: [agent.id],
      }),
    });
    if (res.ok) {
      router.push("/chat");
    }
  }

  async function handleLaunchAgentTeam(team: AgentTeamItem) {
    const memberNames = team.members.map((m) => m.name.toLowerCase());
    const matchedIds = agents
      .filter((a) =>
        memberNames.some((n) => a.name.toLowerCase().includes(n))
      )
      .map((a) => a.id);

    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: team.name,
        type: "GROUP",
        agentIds: matchedIds,
      }),
    });
    if (res.ok) {
      router.push("/chat");
    }
  }

  async function handlePublishPost(e: React.FormEvent) {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: postTitle.trim(),
        category: postCategory,
        content: postContent.trim(),
      }),
    });
    if (res.ok) {
      setPostModalOpen(false);
      setPostTitle("");
      setPostContent("");
      await loadDiscoverData();
    }
  }

  const filteredPosts =
    feedCategory === "All"
      ? posts
      : posts.filter((p) => p.category === feedCategory);

  const filteredTemplates =
    autoCategory === "All"
      ? templates
      : templates.filter((t) => t.category === autoCategory);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto max-w-6xl">
        {/* Top Header + Main Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teamily pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#087c45]">
              <Compass className="h-4 w-4" />
              <span>DISCOVER WORKSPACE</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold">
              Community Feed, Specialist Agents & Automations
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-2xl border border-teamily bg-teamily-surface p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMainTab("feed")}
                className={`rounded-xl px-4 py-2 transition ${
                  mainTab === "feed"
                    ? "bg-[#087c45] text-white"
                    : "text-teamily-secondary hover:text-teamily-primary"
                }`}
              >
                Feed
              </button>
              <button
                type="button"
                onClick={() => setMainTab("agents")}
                data-testid="discover-agents-tab"
                className={`rounded-xl px-4 py-2 transition ${
                  mainTab === "agents"
                    ? "bg-[#087c45] text-white"
                    : "text-teamily-secondary hover:text-teamily-primary"
                }`}
              >
                Agents & Automations
              </button>
            </div>

            {mainTab === "feed" && (
              <button
                type="button"
                data-testid="discover-publish-post-button"
                onClick={() => setPostModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#066a3b]"
              >
                <Plus className="h-4 w-4" />
                Publish Post
              </button>
            )}
          </div>
        </div>

        {/* FEED TAB */}
        {mainTab === "feed" && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-1 rounded-xl border border-teamily bg-teamily-surface p-1 text-xs font-semibold">
                {(["Feeds", "Following"] as const).map((src) => (
                  <button
                    key={src}
                    type="button"
                    data-testid={`discover-feed-source-${src.toLowerCase()}`}
                    onClick={() => setFeedSourceTab(src)}
                    className={`rounded-lg px-3 py-1 transition ${
                      feedSourceTab === src
                        ? "bg-[#087c45] text-white"
                        : "text-teamily-secondary hover:text-teamily-primary"
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {["All", "Agent Teams", "Automations", "Living Wiki"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    data-testid={`discover-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setFeedCategory(cat)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      feedCategory === cat
                        ? "bg-[#ddf3e5] text-[#087c45]"
                        : "bg-teamily-surface text-teamily-secondary hover:text-teamily-primary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col justify-between rounded-2xl border border-teamily bg-teamily-surface p-5 shadow-xs hover:border-[#087c45]/50 transition"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2.5">
                      <span className="rounded-md bg-[#ddf3e5] px-2 py-0.5 font-bold text-[#087c45]">
                        {post.category}
                      </span>
                      <span className="text-teamily-secondary">{post.authorHandle}</span>
                    </div>
                    <Link href={`/post/${post.id}`} className="hover:underline">
                      <h3 className="font-bold text-base leading-snug">{post.title}</h3>
                    </Link>
                    <p className="mt-2 text-xs text-teamily-secondary leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-teamily flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-teamily-secondary">
                      <Heart className="h-3.5 w-3.5 text-[#ff5260]" /> {post.likesCount}
                    </span>
                    <Link
                      href={`/post/${post.id}`}
                      className="font-semibold text-[#087c45] hover:underline"
                    >
                      Open Post →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENTS & AUTOMATIONS TAB */}
        {mainTab === "agents" && (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: "agents", label: "Specialist Agents", icon: Sparkles },
                { id: "teams", label: "Agent Teams (52+)", icon: Users },
                { id: "automations", label: "Work & Life Automations", icon: Zap },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubTab(s.id as typeof subTab)}
                    data-testid={`subtab-${s.id}`}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                      subTab === s.id
                        ? "bg-[#ddf3e5] text-[#087c45]"
                        : "border border-teamily bg-teamily-surface text-teamily-secondary hover:text-teamily-primary"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Specialist Agents Sub-tab */}
            {subTab === "agents" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((ag) => (
                  <div
                    key={ag.id}
                    className="flex flex-col justify-between rounded-2xl border border-teamily bg-teamily-surface p-5"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl text-white"
                          style={{ backgroundColor: ag.avatarBg || "#087c45" }}
                        >
                          {ag.avatarEmoji}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm">{ag.name}</h3>
                          <p className="text-xs text-teamily-secondary line-clamp-1">{ag.title}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-teamily-secondary leading-relaxed">
                        {ag.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-teamily flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#087c45]">
                        {ag.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartAgentChat(ag)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#066a3b]"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Agent Teams Sub-tab */}
            {subTab === "teams" && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {agentTeams.map((team) => (
                  <div
                    key={team.id}
                    className="flex flex-col justify-between rounded-2xl border border-teamily bg-teamily-surface p-6"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base">{team.name}</h3>
                        <span className="rounded-full bg-[#ddf3e5] px-2.5 py-0.5 text-[10px] font-bold text-[#087c45]">
                          {team.category}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-teamily-secondary leading-relaxed">
                        {team.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {team.members.map((m) => (
                          <span
                            key={m.name}
                            className="rounded-lg border border-teamily bg-teamily-main px-2.5 py-1 text-xs font-medium"
                          >
                            {m.emoji} {m.name} •{" "}
                            <span className="text-teamily-secondary">{m.role}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-teamily flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleLaunchAgentTeam(team)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#066a3b]"
                      >
                        <Users className="h-3.5 w-3.5" />
                        Launch Team Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Work & Life Automations Sub-tab */}
            {subTab === "automations" && (
              <div className="space-y-8">
                {/* User's Active Automations */}
                {automations.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-teamily-secondary mb-3">
                      Your Active Scheduled Automations ({automations.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {automations.map((auto) => (
                        <div
                          key={auto.id}
                          className="rounded-2xl border border-[#087c45]/40 bg-teamily-surface p-5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="rounded-md bg-[#ddf3e5] px-2 py-0.5 text-[10px] font-bold text-[#087c45]">
                                {auto.category} • {auto.scheduleType} at {auto.scheduleTime}
                              </span>
                              <h3 className="mt-1.5 font-bold text-sm">{auto.title}</h3>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleTriggerAutomation(auto.id)}
                                title="Run Automation Now"
                                className="inline-flex items-center gap-1 rounded-lg bg-[#087c45] px-2.5 py-1.5 text-xs font-semibold text-white"
                              >
                                <Play className="h-3 w-3" /> Run Now
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAutomation(auto.id)}
                                title="Delete Automation"
                                className="rounded-lg border border-teamily p-1.5 text-teamily-secondary hover:text-[#ff5260]"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-2.5 text-xs text-teamily-secondary italic">
                            “{auto.compiledPrompt}”
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Template Gallery */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-teamily-secondary">
                      Automation Templates (Click to Customize Parameter Chips)
                    </h2>
                    <div className="flex gap-1.5">
                      {(["All", "Work", "Life"] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          data-testid={`auto-filter-${c.toLowerCase()}`}
                          onClick={() => setAutoCategory(c)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                            autoCategory === c
                              ? "bg-[#087c45] text-white"
                              : "bg-teamily-surface text-teamily-secondary"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => openAutomationComposer(tpl)}
                        data-testid={`automation-template-${tpl.id}`}
                        className="text-left rounded-2xl border border-teamily bg-teamily-surface p-5 hover:border-[#087c45] transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 font-bold text-sm">
                              <span className="text-xl">{tpl.icon}</span>
                              {tpl.title}
                            </span>
                            <span className="rounded-full bg-[#ddf3e5] px-2.5 py-0.5 text-[10px] font-bold text-[#087c45]">
                              {tpl.category}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-teamily-secondary leading-relaxed">
                            {tpl.description}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-teamily flex items-center justify-between text-xs">
                          <span className="text-teamily-secondary flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Default: {tpl.defaultSchedule} at {tpl.defaultTime}
                          </span>
                          <span className="font-bold text-[#087c45]">
                            Configure Chips →
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Automation Composer Modal with Interactive Green Parameter Chips */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-teamily bg-teamily-main p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-teamily pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedTemplate.icon}</span>
                <div>
                  <h3 className="text-lg font-bold">{selectedTemplate.title}</h3>
                  <p className="text-xs text-teamily-secondary">
                    Click any green parameter chip below to customize your recurring prompt
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="rounded-lg p-1.5 text-teamily-secondary hover:bg-teamily-subtle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Interactive Chip Selector Pills */}
              <div className="rounded-2xl border border-teamily bg-teamily-surface p-4 space-y-3">
                <p className="text-xs font-bold text-teamily-secondary uppercase">
                  Interactive Parameter Chips (Click to Cycle)
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.chips.map((chip) => {
                    const currentVal = chipValues[chip.id] || chip.defaultOption;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => cycleChipOption(chip.id, chip.options)}
                        data-testid={`automation-chip-${chip.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#ddf3e5] px-3 py-1.5 text-xs font-bold text-[#087c45] hover:bg-[#087c45] hover:text-white transition"
                      >
                        <span>{chip.label}:</span>
                        <span className="underline">{currentVal}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-xl bg-teamily-main border border-teamily p-3 text-xs leading-relaxed">
                  <p className="text-[10px] font-bold text-teamily-secondary uppercase mb-1">
                    Compiled Prompt Preview:
                  </p>
                  <p data-testid="compiled-automation-prompt" className="font-medium">
                    {compileAutomationPrompt(selectedTemplate.promptTemplate, chipValues)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Cadence
                  </label>
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value as typeof scheduleType)}
                    className="w-full rounded-xl border border-teamily bg-teamily-surface px-3 py-2 text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="once">Once</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Delivery Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full rounded-xl border border-teamily bg-teamily-surface px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="rounded-xl border border-teamily px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingAuto}
                  onClick={handleSaveAutomation}
                  data-testid="save-automation-button"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-5 py-2 text-xs font-bold text-white hover:bg-[#066a3b]"
                >
                  <Check className="h-4 w-4" />
                  {savingAuto ? "Scheduling..." : "Activate Automation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Community Post Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-teamily bg-teamily-main p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-teamily pb-3">
              <h3 className="text-lg font-bold">Share Workflow to Community Feed</h3>
              <button
                type="button"
                onClick={() => setPostModalOpen(false)}
                className="rounded-lg p-1.5 text-teamily-secondary hover:bg-teamily-subtle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                  Post Title *
                </label>
                <input
                  type="text"
                  required
                  data-testid="publish-post-title"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="How we automated our weekly competitive radar..."
                  className="w-full rounded-xl border border-teamily bg-teamily-surface px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                  Category
                </label>
                <select
                  data-testid="publish-post-category"
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full rounded-xl border border-teamily bg-teamily-surface px-3.5 py-2 text-sm"
                >
                  <option value="Agent Teams">Agent Teams</option>
                  <option value="Automations">Automations</option>
                  <option value="Living Wiki">Living Wiki</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                  Workflow Writeup / Prompt *
                </label>
                <textarea
                  rows={4}
                  required
                  data-testid="publish-post-content"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share the agents, prompts, and Living Wiki structure you used..."
                  className="w-full rounded-xl border border-teamily bg-teamily-surface px-3.5 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="rounded-xl border border-teamily px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="publish-post-submit"
                  className="rounded-xl bg-[#087c45] px-5 py-2 text-xs font-bold text-white"
                >
                  Publish to Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <WorkspaceShell>
      <Suspense fallback={<div className="p-8 text-sm text-teamily-secondary">Loading Discover...</div>}>
        <DiscoverContent />
      </Suspense>
    </WorkspaceShell>
  );
}
