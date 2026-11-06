"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import {
  Search,
  Plus,
  Send,
  Pin,
  Sparkles,
  Users,
  Bot,
  CheckCircle2,
  Circle,
  PanelRightOpen,
  PanelRightClose,
  Trash2,
  FileCode2,
  X,
  Zap,
  ChevronDown,
} from "lucide-react";

interface AgentInfo {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: string;
  description: string;
  avatarEmoji: string;
  avatarBg: string;
}

interface ConversationMember {
  id: string;
  memberType: string;
  displayName: string;
  avatarEmoji?: string | null;
  agentId?: string | null;
  agent?: AgentInfo | null;
}

interface ChatMessage {
  id: string;
  senderType: string;
  senderName: string;
  mode: string;
  content: string;
  metadataJson: string;
  createdAt: string;
}

interface ConversationItem {
  id: string;
  title: string;
  type: string;
  mode: "Auto" | "Instant" | "Agentic";
  isPinned: boolean;
  updatedAt: string;
  members: ConversationMember[];
  messages?: ChatMessage[];
}

interface OnboardingTask {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

export default function ChatWorkspacePage() {
  const router = useRouter();
  const { status } = useSession();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"Auto" | "Instant" | "Agentic">("Auto");
  const [sending, setSending] = useState(false);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  // UI Drawers & Modals
  const [infoOpen, setInfoOpen] = useState(true);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);

  // New Group Modal State
  const [groupTitle, setGroupTitle] = useState("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  // Create Agent Modal State (Simple / Pro)
  const [agentBuilderTab, setAgentBuilderTab] = useState<"Simple" | "Pro">("Simple");
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentTitle, setNewAgentTitle] = useState("");
  const [newAgentEmoji, setNewAgentEmoji] = useState("🤖");
  const [newAgentDesc, setNewAgentDesc] = useState("");
  const [newAgentPrompt, setNewAgentPrompt] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      loadWorkspaceData();
    }
  }, [status]);

  async function loadWorkspaceData(selectConvId?: string) {
    setLoadingWorkspace(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      const convList: ConversationItem[] = data.conversations || [];
      setConversations(convList);
      setOnboardingTasks(data.onboardingTasks || []);
      setAgents(data.agents || []);

      const targetId = selectConvId || activeConv?.id || convList[0]?.id;
      if (targetId) {
        await loadConversationDetail(targetId);
      }
    } finally {
      setLoadingWorkspace(false);
    }
  }

  async function loadConversationDetail(convId: string) {
    const res = await fetch(`/api/conversations/${convId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.conversation) {
      setActiveConv(data.conversation);
      setMessages(data.conversation.messages || []);
      setMode(data.conversation.mode || "Auto");
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(e?: React.FormEvent, customPrompt?: string) {
    if (e) e.preventDefault();
    const text = (customPrompt ?? prompt).trim();
    if (!text || !activeConv || sending) return;

    setPrompt("");
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeConv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, mode }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          data.userMessage,
          ...(data.agentMessages || []),
        ]);
      }
    } finally {
      setSending(false);
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!groupTitle.trim()) return;
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: groupTitle.trim(),
        type: "GROUP",
        mode: "Auto",
        agentIds: selectedAgentIds,
      }),
    });
    const data = await res.json();
    if (res.ok && data.conversation) {
      setCreateGroupOpen(false);
      setGroupTitle("");
      setSelectedAgentIds([]);
      await loadWorkspaceData(data.conversation.id);
    }
  }

  async function handleCreateAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!newAgentName.trim()) return;
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newAgentName.trim(),
        title: newAgentTitle.trim() || "Custom Specialist Agent",
        description: newAgentDesc.trim(),
        systemPrompt: newAgentPrompt.trim(),
        avatarEmoji: newAgentEmoji,
      }),
    });
    const data = await res.json();
    if (res.ok && data.agent) {
      setCreateAgentOpen(false);
      setNewAgentName("");
      setNewAgentTitle("");
      setNewAgentDesc("");
      setNewAgentPrompt("");
      // Immediately start a direct chat with the new custom agent
      const convRes = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.agent.name,
          type: "DIRECT_AGENT",
          agentIds: [data.agent.id],
        }),
      });
      const convData = await convRes.json();
      await loadWorkspaceData(convData.conversation?.id);
    }
  }

  async function handleTogglePin(conv: ConversationItem) {
    const res = await fetch(`/api/conversations/${conv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !conv.isPinned }),
    });
    if (res.ok) {
      await loadWorkspaceData(conv.id);
    }
  }

  async function handleDeleteConversation(convId: string) {
    const res = await fetch(`/api/conversations/${convId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (remaining[0]) {
        await loadConversationDetail(remaining[0].id);
      } else {
        setActiveConv(null);
        setMessages([]);
      }
    }
  }

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pinnedConvs = filteredConversations.filter((c) => c.isPinned);
  const regularConvs = filteredConversations.filter((c) => !c.isPinned);
  const completedOnboardingCount = onboardingTasks.filter((t) => t.isCompleted).length;

  return (
    <WorkspaceShell>
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Conversation List Sidebar */}
        <aside className="w-72 shrink-0 border-r border-teamily bg-teamily-surface flex flex-col h-full">
          {/* Top Search + Plus Action */}
          <div className="p-3.5 border-b border-teamily flex items-center gap-2 relative">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-teamily-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats & agents..."
                className="w-full rounded-xl border border-teamily bg-teamily-main pl-9 pr-3 py-2 text-xs focus:border-[#087c45] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setPlusMenuOpen(!plusMenuOpen)}
              data-testid="chat-plus-button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#087c45] text-white hover:bg-[#066a3b] transition"
              title="Create Agent or New Group"
            >
              <Plus className="h-4 w-4" />
            </button>

            {plusMenuOpen && (
              <div className="absolute right-3.5 top-14 z-40 w-48 rounded-2xl border border-teamily bg-teamily-main p-1.5 shadow-xl text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setPlusMenuOpen(false);
                    setCreateAgentOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium hover:bg-teamily-subtle"
                >
                  <Bot className="h-4 w-4 text-[#087c45]" />
                  Create Agent
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlusMenuOpen(false);
                    setCreateGroupOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium hover:bg-teamily-subtle"
                >
                  <Users className="h-4 w-4 text-[#087c45]" />
                  New Group
                </button>
              </div>
            )}
          </div>

          {/* First-Week Onboarding Progress Card */}
          <div className="px-3.5 pt-3">
            <button
              type="button"
              onClick={() => setOnboardingOpen(!onboardingOpen)}
              className="w-full rounded-2xl border border-[#087c45]/30 bg-[#ddf3e5]/60 p-3 text-left transition hover:bg-[#ddf3e5]"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#087c45]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  First-Week Onboarding
                </span>
                <span>
                  {completedOnboardingCount}/{onboardingTasks.length || 7}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-white/70 overflow-hidden">
                <div
                  className="h-full bg-[#087c45] transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((completedOnboardingCount / Math.max(1, onboardingTasks.length)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </button>

            {onboardingOpen && (
              <div className="mt-2 rounded-2xl border border-teamily bg-teamily-main p-3 space-y-2 max-h-56 overflow-y-auto text-xs">
                {onboardingTasks.map((t) => (
                  <div key={t.id} className="flex items-start gap-2">
                    {t.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-[#087c45] shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-4 w-4 text-teamily-secondary shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold ${t.isCompleted ? "line-through text-teamily-secondary" : ""}`}>
                        Day {t.dayNumber}: {t.title}
                      </p>
                      <p className="text-[11px] text-teamily-secondary">{t.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
            {pinnedConvs.length > 0 && (
              <div>
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-teamily-secondary mb-1.5">
                  Pinned
                </p>
                <div className="space-y-1">
                  {pinnedConvs.map((c) => {
                    const isSelected = activeConv?.id === c.id;
                    const agentMember = c.members.find((m) => m.memberType === "AGENT");
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => loadConversationDetail(c.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                          isSelected
                            ? "bg-[#ddf3e5] text-[#087c45] font-semibold"
                            : "hover:bg-teamily-subtle"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#087c45] text-white text-sm">
                            {agentMember?.avatarEmoji || "🤖"}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">{c.title}</p>
                            <p className="text-[10px] text-teamily-secondary truncate">
                              {c.type === "GROUP"
                                ? `${c.members.filter((m) => m.memberType === "AGENT").length} Agents`
                                : c.mode}
                            </p>
                          </div>
                        </div>
                        <Pin className="h-3 w-3 shrink-0 text-[#087c45]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-teamily-secondary mb-1.5">
                All Conversations
              </p>
              <div className="space-y-1">
                {regularConvs.map((c) => {
                  const isSelected = activeConv?.id === c.id;
                  const agentMember = c.members.find((m) => m.memberType === "AGENT");
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => loadConversationDetail(c.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "bg-[#ddf3e5] text-[#087c45] font-semibold"
                          : "hover:bg-teamily-subtle"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teamily-subtle text-sm">
                          {agentMember?.avatarEmoji || "💬"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{c.title}</p>
                          <p className="text-[10px] text-teamily-secondary truncate">
                            {c.type === "GROUP"
                              ? `Group • ${c.members.filter((m) => m.memberType === "AGENT").length} Agents`
                              : "Direct Agent"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Stage */}
        <section className="flex-1 flex flex-col min-w-0 bg-teamily-main">
          {/* Chat Header */}
          <header className="flex items-center justify-between border-b border-teamily px-6 py-3.5 bg-teamily-main">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex -space-x-1.5">
                {activeConv?.members
                  .filter((m) => m.memberType === "AGENT")
                  .slice(0, 3)
                  .map((m) => (
                    <span
                      key={m.id}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#087c45] text-white text-sm ring-2 ring-white dark:ring-[#0c1310]"
                    >
                      {m.avatarEmoji || "🤖"}
                    </span>
                  ))}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-sm sm:text-base truncate">
                    {activeConv?.title || (loadingWorkspace ? "Loading Workspace..." : "Personal Agent")}
                  </h1>
                  <span className="rounded-md bg-[#ddf3e5] px-2 py-0.5 text-[10px] font-bold text-[#087c45]">
                    {mode}
                  </span>
                </div>
                <p className="text-xs text-teamily-secondary truncate">
                  {activeConv?.members
                    .filter((m) => m.memberType === "AGENT")
                    .map((m) => m.displayName)
                    .join(" • ") || "Autonomous Workspace Companion"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCreateGroupOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-teamily bg-teamily-surface px-3 py-1.5 text-xs font-semibold hover:bg-teamily-subtle transition"
              >
                <Users className="h-3.5 w-3.5 text-[#087c45]" />
                New Group
              </button>
              <button
                type="button"
                onClick={() => setInfoOpen(!infoOpen)}
                className="rounded-xl border border-teamily bg-teamily-surface p-2 text-teamily-secondary hover:text-teamily-primary"
                title="Toggle Room Info"
              >
                {infoOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </button>
            </div>
          </header>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.map((msg) => {
              const isUser = msg.senderType === "USER";
              let meta: {
                steps?: string[];
                creditsUsed?: number;
                avatarEmoji?: string;
                artifactId?: string | null;
              } = {};
              try {
                meta = JSON.parse(msg.metadataJson || "{}");
              } catch {
                meta = {};
              }

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#087c45] text-white text-base shadow-xs">
                      {meta.avatarEmoji || "🤖"}
                    </span>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#087c45] text-white"
                        : "border border-teamily bg-teamily-surface text-teamily-primary"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-80">
                      <span className="font-bold">{msg.senderName}</span>
                      <span>{msg.mode}</span>
                    </div>

                    {!isUser && meta.steps && meta.steps.length > 0 && (
                      <div className="mb-2.5 flex flex-wrap gap-1.5">
                        {meta.steps.map((step) => (
                          <span
                            key={step}
                            className="inline-flex items-center gap-1 rounded-md bg-[#ddf3e5] px-2 py-0.5 text-[10px] font-semibold text-[#087c45]"
                          >
                            <Zap className="h-2.5 w-2.5" />
                            {step}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="whitespace-pre-wrap text-xs sm:text-sm">{msg.content}</div>

                    {meta.artifactId && (
                      <div className="mt-3 pt-2.5 border-t border-teamily flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#087c45] flex items-center gap-1.5">
                          <FileCode2 className="h-4 w-4" />
                          Saved Deliverable to Artifacts
                        </span>
                        <Link
                          href={`/tiptap/${meta.artifactId}`}
                          className="rounded-lg bg-[#087c45] px-3 py-1 text-xs font-semibold text-white hover:bg-[#066a3b]"
                        >
                          Open Document →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions + Composer */}
          <div className="border-t border-teamily bg-teamily-main px-6 py-4">
            <div className="mb-2.5 flex flex-wrap gap-2">
              {[
                "Summarize our Q2 priorities and save to Living Wiki",
                "Generate an interactive product launch spec artifact",
                "Stress-test our pricing strategy from first principles",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSendMessage(undefined, suggestion)}
                  className="rounded-full border border-teamily bg-teamily-surface px-3 py-1 text-xs text-teamily-secondary hover:border-[#087c45] hover:text-[#087c45] transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => handleSendMessage(e)}
              className="rounded-2xl border border-teamily bg-teamily-surface p-2.5 shadow-xs focus-within:border-[#087c45]"
            >
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask your Personal Agent or @mention a specialist (Auto / Instant / Agentic)..."
                data-testid="chat-composer-input"
                className="w-full resize-none bg-transparent px-2 py-1 text-sm focus:outline-none"
              />

              <div className="flex items-center justify-between pt-2 border-t border-teamily/60">
                <div className="flex items-center gap-1.5">
                  {(["Auto", "Instant", "Agentic"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        mode === m
                          ? "bg-[#087c45] text-white"
                          : "bg-teamily-main text-teamily-secondary hover:text-teamily-primary"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={sending || !prompt.trim()}
                  data-testid="chat-send-button"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#066a3b] disabled:opacity-50 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  {sending ? "Thinking..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Right Chat Info Drawer */}
        {infoOpen && activeConv && (
          <aside className="hidden lg:flex w-72 shrink-0 border-l border-teamily bg-teamily-surface flex-col p-4 overflow-y-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teamily-secondary">
              Chat Info & Members
            </h2>

            <div className="mt-3 rounded-2xl border border-teamily bg-teamily-main p-3.5">
              <p className="font-bold text-sm">{activeConv.title}</p>
              <p className="text-xs text-teamily-secondary mt-0.5">
                Type: {activeConv.type} • Mode: {mode}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePin(activeConv)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-teamily py-1.5 text-xs font-semibold hover:bg-teamily-subtle"
                >
                  <Pin className="h-3.5 w-3.5" />
                  {activeConv.isPinned ? "Unpin" : "Pin"}
                </button>
                {!activeConv.isPinned && (
                  <button
                    type="button"
                    onClick={() => handleDeleteConversation(activeConv.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-[#ff5260]/40 px-2.5 py-1.5 text-xs text-[#ff5260] hover:bg-[#ff5260]/10"
                    title="Delete Conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold text-teamily-secondary mb-2">
                Participants ({activeConv.members.length})
              </p>
              <div className="space-y-2">
                {activeConv.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 rounded-xl border border-teamily bg-teamily-main p-2.5 text-xs"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ddf3e5] text-sm">
                      {m.avatarEmoji || "👤"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{m.displayName}</p>
                      <p className="text-[10px] text-teamily-secondary">{m.memberType}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-teamily space-y-2 text-xs">
              <p className="font-bold text-teamily-secondary">Workspace Shortcuts</p>
              <Link
                href="/memory"
                className="block rounded-xl border border-teamily bg-teamily-main px-3 py-2 font-medium hover:border-[#087c45]"
              >
                🧠 Open Living Wiki Memory →
              </Link>
              <Link
                href="/artifacts"
                className="block rounded-xl border border-teamily bg-teamily-main px-3 py-2 font-medium hover:border-[#087c45]"
              >
                ✨ View Saved Artifacts →
              </Link>
            </div>
          </aside>
        )}
      </div>

      {/* Create Multi-Agent Group Modal */}
      {createGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-teamily bg-teamily-main p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-teamily pb-3">
              <div>
                <h3 className="text-lg font-bold">Create Multi-Agent Group</h3>
                <p className="text-xs text-teamily-secondary">
                  Select specialist AI agents to collaborate in one shared room
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateGroupOpen(false)}
                className="rounded-lg p-1.5 text-teamily-secondary hover:bg-teamily-subtle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                  Group Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="e.g. Q3 Product Launch War Room"
                  className="w-full rounded-xl border border-teamily bg-teamily-surface px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1.5">
                  Select Specialist Agents ({selectedAgentIds.length} selected)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {agents.map((ag) => {
                    const checked = selectedAgentIds.includes(ag.id);
                    return (
                      <button
                        key={ag.id}
                        type="button"
                        onClick={() =>
                          setSelectedAgentIds((prev) =>
                            checked ? prev.filter((id) => id !== ag.id) : [...prev, ag.id]
                          )
                        }
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs transition ${
                          checked
                            ? "border-[#087c45] bg-[#ddf3e5]/60 font-semibold"
                            : "border-teamily bg-teamily-surface hover:bg-teamily-subtle"
                        }`}
                      >
                        <span className="text-lg">{ag.avatarEmoji}</span>
                        <div className="min-w-0">
                          <p className="truncate font-bold">{ag.name}</p>
                          <p className="truncate text-[10px] text-teamily-secondary">{ag.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateGroupOpen(false)}
                  className="rounded-xl border border-teamily px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#087c45] px-5 py-2 text-xs font-bold text-white hover:bg-[#066a3b]"
                >
                  Launch Group Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Custom Agent Modal (Simple / Pro) */}
      {createAgentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-teamily bg-teamily-main p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-teamily pb-3">
              <div>
                <h3 className="text-lg font-bold">Create Custom AI Agent</h3>
                <p className="text-xs text-teamily-secondary">
                  Configure a specialist agent with custom instructions, skills & memory access
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateAgentOpen(false)}
                className="rounded-lg p-1.5 text-teamily-secondary hover:bg-teamily-subtle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 rounded-xl bg-teamily-subtle p-1 text-xs font-semibold">
              {(["Simple", "Pro"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAgentBuilderTab(t)}
                  className={`rounded-lg py-1.5 transition ${
                    agentBuilderTab === t ? "bg-teamily-main shadow-xs" : "text-teamily-secondary"
                  }`}
                >
                  {t} Mode
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateAgent} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Avatar
                  </label>
                  <input
                    type="text"
                    value={newAgentEmoji}
                    onChange={(e) => setNewAgentEmoji(e.target.value)}
                    className="w-full rounded-xl border border-teamily bg-teamily-surface px-3 py-2 text-center text-lg"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="e.g. FinOps Strategist"
                    className="w-full rounded-xl border border-teamily bg-teamily-surface px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  value={newAgentTitle}
                  onChange={(e) => setNewAgentTitle(e.target.value)}
                  placeholder="e.g. Cloud Cost & Unit Economics Advisor"
                  className="w-full rounded-xl border border-teamily bg-teamily-surface px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newAgentDesc}
                  onChange={(e) => setNewAgentDesc(e.target.value)}
                  placeholder="What does this agent specialize in?"
                  className="w-full rounded-xl border border-teamily bg-teamily-surface px-3.5 py-2 text-xs"
                />
              </div>

              {agentBuilderTab === "Pro" && (
                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    System Prompt & Skill Directives
                  </label>
                  <textarea
                    rows={3}
                    value={newAgentPrompt}
                    onChange={(e) => setNewAgentPrompt(e.target.value)}
                    placeholder="You are a principal FinOps architect. Always quantify unit-economic impact..."
                    className="w-full rounded-xl border border-teamily bg-teamily-surface px-3.5 py-2 font-mono text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateAgentOpen(false)}
                  className="rounded-xl border border-teamily px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#087c45] px-5 py-2 text-xs font-bold text-white hover:bg-[#066a3b]"
                >
                  Create & Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}
