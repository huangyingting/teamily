"use client";

import React, { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import {
  Brain,
  BookOpen,
  CheckSquare,
  Calendar,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";

interface WikiPageItem {
  id: string;
  title: string;
  slug: string;
  icon: string;
  category: string;
  content: string;
  version: number;
  updatedAt: string;
}

interface NextActionItem {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

export default function MemoryPage() {
  const [tab, setTab] = useState<
    "overview" | "wiki" | "profile" | "actions" | "artifacts" | "meetings"
  >("overview");
  const [pages, setPages] = useState<WikiPageItem[]>([]);
  const [selectedPage, setSelectedPage] = useState<WikiPageItem | null>(null);
  const [nextActions, setNextActions] = useState<NextActionItem[]>([]);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingNotes, setNewMeetingNotes] = useState("");

  // Wiki editor state
  const [editTitle, setEditTitle] = useState("");
  const [editIcon, setEditIcon] = useState("📄");
  const [editCategory, setEditCategory] = useState("Workspace Core");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    loadMemoryData();
  }, []);

  async function loadMemoryData(selectId?: string) {
    const res = await fetch("/api/wiki");
    if (!res.ok) return;
    const data = await res.json();
    const list: WikiPageItem[] = data.pages || [];
    setPages(list);
    setNextActions(data.nextActions || []);

    const target = list.find((p) => p.id === (selectId || selectedPage?.id)) || list[0] || null;
    if (target) {
      selectWikiPage(target);
    }
  }

  function selectWikiPage(page: WikiPageItem) {
    setSelectedPage(page);
    setEditTitle(page.title);
    setEditIcon(page.icon || "📄");
    setEditCategory(page.category || "General");
    setEditContent(page.content);
  }

  async function handleCreateWikiPage() {
    const res = await fetch("/api/wiki", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New Living Wiki Page",
        icon: "📘",
        category: "Knowledge Base",
        content:
          "# New Living Wiki Page\n\nDocument key decisions, project architecture, and operating principles for your AI agents.",
      }),
    });
    const data = await res.json();
    if (res.ok && data.page) {
      setTab("wiki");
      await loadMemoryData(data.page.id);
    }
  }

  async function handleSaveWikiPage() {
    if (!selectedPage) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/wiki/${selectedPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          icon: editIcon,
          category: editCategory,
          content: editContent,
        }),
      });
      if (res.ok) {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
        await loadMemoryData(selectedPage.id);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWikiPage(id: string) {
    await fetch(`/api/wiki/${id}`, { method: "DELETE" });
    setSelectedPage(null);
    await loadMemoryData();
  }

  async function handleToggleAction(item: NextActionItem) {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toggleOnboardingDay: item.dayNumber,
        isCompleted: !item.isCompleted,
      }),
    });
    await loadMemoryData();
  }

  return (
    <WorkspaceShell>
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Top Memory Header & Sub-navigation */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teamily px-6 py-4 bg-teamily-main">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#087c45]">
              <Brain className="h-4 w-4" />
              <span>LIVING MEMORY & KNOWLEDGE GRAPH</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              Workspace Memory
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap rounded-2xl border border-teamily bg-teamily-surface p-1 text-xs font-semibold">
              {[
                { id: "overview", label: "Overview", icon: Brain },
                { id: "wiki", label: "Wiki", icon: BookOpen },
                { id: "profile", label: "My Profile", icon: Sparkles },
                { id: "actions", label: "Next Actions", icon: CheckSquare },
                { id: "artifacts", label: "My Artifacts", icon: BookOpen },
                { id: "meetings", label: "Meetings", icon: Calendar },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id as typeof tab)}
                    data-testid={`memory-tab-${t.id}`}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
                      tab === t.id
                        ? "bg-[#087c45] text-white"
                        : "text-teamily-secondary hover:text-teamily-primary"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCreateWikiPage}
              data-testid="memory-new-page-button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#066a3b]"
            >
              <Plus className="h-4 w-4" />
              New Page
            </button>
          </div>
        </header>

        {/* OVERVIEW TAB: Interactive Knowledge Graph */}
        {tab === "overview" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-6xl space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-teamily bg-teamily-surface p-5">
                  <p className="text-xs font-bold text-teamily-secondary uppercase">
                    Living Wiki Pages
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-[#087c45]">{pages.length}</p>
                  <p className="mt-1 text-xs text-teamily-secondary">
                    Indexed into Personal Agent & Swarm context
                  </p>
                </div>
                <div className="rounded-2xl border border-teamily bg-teamily-surface p-5">
                  <p className="text-xs font-bold text-teamily-secondary uppercase">
                    Tracked Next Actions
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-[#087c45]">
                    {nextActions.filter((a) => !a.isCompleted).length} Open
                  </p>
                  <p className="mt-1 text-xs text-teamily-secondary">
                    {nextActions.filter((a) => a.isCompleted).length} completed milestones
                  </p>
                </div>
                <div className="rounded-2xl border border-teamily bg-teamily-surface p-5">
                  <p className="text-xs font-bold text-teamily-secondary uppercase">
                    Memory Sync Status
                  </p>
                  <p className="mt-2 text-xl font-extrabold flex items-center gap-2 text-[#087c45]">
                    <Sparkles className="h-5 w-5" /> Active & Auto-Indexing
                  </p>
                  <p className="mt-1 text-xs text-teamily-secondary">
                    All specialist agents share this Living Wiki
                  </p>
                </div>
              </div>

              {/* Interactive SVG Knowledge Graph */}
              <div className="rounded-3xl border border-teamily bg-teamily-surface p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold">Living Wiki Knowledge Graph</h2>
                    <p className="text-xs text-teamily-secondary">
                      Click any node in the graph to inspect or edit the linked Living Wiki page
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("wiki")}
                    className="rounded-xl bg-[#ddf3e5] px-3.5 py-1.5 text-xs font-bold text-[#087c45]"
                  >
                    Open Full Wiki Editor →
                  </button>
                </div>

                <div className="relative h-80 w-full rounded-2xl border border-teamily bg-teamily-main flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full max-w-3xl" viewBox="0 0 700 300">
                    {/* Edges */}
                    {pages.slice(0, 5).map((p, idx) => {
                      const angle = (idx / Math.max(1, Math.min(5, pages.length))) * Math.PI * 2;
                      const x = 350 + Math.cos(angle) * 190;
                      const y = 150 + Math.sin(angle) * 95;
                      return (
                        <line
                          key={`edge-${p.id}`}
                          x1={350}
                          y1={150}
                          x2={x}
                          y2={y}
                          stroke="#087c45"
                          strokeOpacity={0.35}
                          strokeWidth={2}
                          strokeDasharray="4 4"
                        />
                      );
                    })}

                    {/* Central Personal Agent Hub Node */}
                    <g>
                      <circle cx={350} cy={150} r={38} fill="#087c45" />
                      <text
                        x={350}
                        y={146}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        Personal
                      </text>
                      <text
                        x={350}
                        y={161}
                        textAnchor="middle"
                        fill="#ddf3e5"
                        fontSize="10"
                      >
                        Agent Hub
                      </text>
                    </g>

                    {/* Connected Wiki Page Nodes */}
                    {pages.slice(0, 5).map((p, idx) => {
                      const angle = (idx / Math.max(1, Math.min(5, pages.length))) * Math.PI * 2;
                      const x = 350 + Math.cos(angle) * 190;
                      const y = 150 + Math.sin(angle) * 95;
                      return (
                        <g
                          key={p.id}
                          className="cursor-pointer"
                          onClick={() => {
                            selectWikiPage(p);
                            setTab("wiki");
                          }}
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={28}
                            fill="#ddf3e5"
                            stroke="#087c45"
                            strokeWidth={2}
                          />
                          <text
                            x={x}
                            y={y + 4}
                            textAnchor="middle"
                            fill="#087c45"
                            fontSize="14"
                          >
                            {p.icon || "📄"}
                          </text>
                          <text
                            x={x}
                            y={y + 44}
                            textAnchor="middle"
                            fill="currentColor"
                            fontSize="11"
                            fontWeight="600"
                          >
                            {p.title.slice(0, 22)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WIKI TAB: Sidebar + Markdown Editor */}
        {tab === "wiki" && (
          <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 shrink-0 border-r border-teamily bg-teamily-surface p-3 overflow-y-auto space-y-1.5">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-teamily-secondary mb-2">
                Living Wiki Pages ({pages.length})
              </p>
              {pages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectWikiPage(p)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition ${
                    selectedPage?.id === p.id
                      ? "bg-[#ddf3e5] text-[#087c45] font-bold"
                      : "hover:bg-teamily-subtle"
                  }`}
                >
                  <span>{p.icon || "📄"}</span>
                  <span className="truncate">{p.title}</span>
                </button>
              ))}
            </aside>

            <section className="flex-1 flex flex-col p-6 overflow-y-auto">
              {selectedPage ? (
                <div className="mx-auto w-full max-w-3xl space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        className="w-12 rounded-xl border border-teamily bg-teamily-surface py-2 text-center text-lg"
                      />
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        data-testid="wiki-title-input"
                        className="flex-1 rounded-xl border border-teamily bg-teamily-surface px-3.5 py-2 text-lg font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleSaveWikiPage}
                        data-testid="wiki-save-button"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#066a3b]"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {saving ? "Saving..." : savedNotice ? "Saved ✓" : "Save Page"}
                      </button>
                      {pages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteWikiPage(selectedPage.id)}
                          className="rounded-xl border border-teamily p-2 text-teamily-secondary hover:text-[#ff5260]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-teamily-secondary">
                    <span>Category: {editCategory}</span>
                    <span>Version v{selectedPage.version}</span>
                  </div>

                  <textarea
                    rows={16}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    data-testid="wiki-content-textarea"
                    className="w-full rounded-2xl border border-teamily bg-teamily-surface p-4 font-mono text-xs sm:text-sm leading-relaxed focus:border-[#087c45] focus:outline-none"
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-teamily-secondary">
                  Select or create a Living Wiki page to begin editing.
                </div>
              )}
            </section>
          </div>
        )}

        {/* MY PROFILE MEMORY TAB */}
        {tab === "profile" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl rounded-3xl border border-teamily bg-teamily-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Personal AI Context & Life Goals Memory</h2>
                  <p className="text-xs text-teamily-secondary">
                    Automatically injected into Personal Agent and Swarm war rooms
                  </p>
                </div>
                <a
                  href="/profile/edit"
                  className="rounded-xl bg-[#087c45] px-3.5 py-2 text-xs font-bold text-white"
                >
                  Edit Profile & Life Goals →
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { label: "Decision Style", value: "First-principles, data-backed, concise memos" },
                  { label: "Active Workspace Focus", value: "Multi-agent orchestration & product velocity" },
                  { label: "Communication Tone", value: "Direct, analytical, zero fluff" },
                  { label: "Memory Conflict Resolution", value: "Auto-flag conflicting numbers before overwriting" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-teamily bg-teamily-main p-4">
                    <p className="font-bold text-[#087c45]">{item.label}</p>
                    <p className="mt-1 text-teamily-secondary">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MY ARTIFACTS MEMORY TAB */}
        {tab === "artifacts" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl rounded-3xl border border-teamily bg-teamily-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Memory-Indexed Deliverables & Artifacts</h2>
                  <p className="text-xs text-teamily-secondary">
                    Cloud Documents, HTML prototypes, and Whiteboards linked to your Knowledge Graph
                  </p>
                </div>
                <a
                  href="/artifacts"
                  className="rounded-xl bg-[#087c45] px-3.5 py-2 text-xs font-bold text-white"
                >
                  Open Artifacts Studio →
                </a>
              </div>
              <div className="space-y-2 text-xs">
                {pages.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl border border-teamily bg-teamily-main p-3.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{p.icon}</span>
                      <div>
                        <p className="font-bold">{p.title}</p>
                        <p className="text-[10px] text-teamily-secondary">
                          Category: {p.category} • v{p.version}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        selectWikiPage(p);
                        setTab("wiki");
                      }}
                      className="rounded-lg bg-[#ddf3e5] px-3 py-1 font-bold text-[#087c45]"
                    >
                      Inspect Node
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NEXT ACTIONS TAB */}
        {tab === "actions" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-3">
              <h2 className="text-base font-bold mb-2">
                Action Items & Workspace Commitments
              </h2>
              {nextActions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleAction(item)}
                  className="cursor-pointer flex items-start gap-3 rounded-2xl border border-teamily bg-teamily-surface p-4 hover:border-[#087c45] transition"
                >
                  {item.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-[#087c45] shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-teamily-secondary shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        item.isCompleted ? "line-through text-teamily-secondary" : ""
                      }`}
                    >
                      Day {item.dayNumber}: {item.title}
                    </p>
                    <p className="text-xs text-teamily-secondary mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEETINGS TAB */}
        {tab === "meetings" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="rounded-3xl border border-teamily bg-teamily-surface p-6">
                <h2 className="text-lg font-bold">Log Meeting Transcript & Extract Decisions</h2>
                <p className="mt-1 text-xs text-teamily-secondary">
                  Paste meeting notes or transcripts to automatically synthesize a Living Wiki dossier.
                </p>
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    data-testid="meeting-title-input"
                    value={newMeetingTitle}
                    onChange={(e) => setNewMeetingTitle(e.target.value)}
                    placeholder="e.g. Weekly Product & Engineering Sync"
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3.5 py-2 text-xs"
                  />
                  <textarea
                    rows={3}
                    data-testid="meeting-notes-textarea"
                    value={newMeetingNotes}
                    onChange={(e) => setNewMeetingNotes(e.target.value)}
                    placeholder="Paste transcript or key takeaways..."
                    className="w-full rounded-xl border border-teamily bg-teamily-main p-3 text-xs"
                  />
                  <button
                    type="button"
                    data-testid="save-meeting-dossier-button"
                    onClick={async () => {
                      if (!newMeetingTitle.trim()) return;
                      const res = await fetch("/api/wiki", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: newMeetingTitle.trim(),
                          icon: "🎙️",
                          category: "Meetings",
                          content: `# ${newMeetingTitle.trim()}\n\n${
                            newMeetingNotes.trim() || "Synthesized meeting decisions and action owners."
                          }`,
                        }),
                      });
                      const data = await res.json();
                      setNewMeetingTitle("");
                      setNewMeetingNotes("");
                      if (res.ok && data.page) {
                        setTab("wiki");
                        await loadMemoryData(data.page.id);
                      }
                    }}
                    className="rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#066a3b]"
                  >
                    Save Meeting to Living Wiki
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
