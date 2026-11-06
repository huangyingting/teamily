"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import {
  FileCode2,
  Plus,
  Search,
  Star,
  FileText,
  Code,
  Trash2,
  ArrowUpRight,
} from "lucide-react";

interface ArtifactItem {
  id: string;
  title: string;
  type: "DOCUMENT" | "HTML" | "CODE" | "MARKDOWN";
  previewText: string | null;
  isFavorited: boolean;
  updatedAt: string;
}

export default function ArtifactsPage() {
  const router = useRouter();
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "FAVORITES" | "DOCUMENTS" | "ARTIFACTS">("ALL");
  const [search, setSearch] = useState("");
  const [newMenuOpen, setNewMenuOpen] = useState(false);

  useEffect(() => {
    loadArtifacts();
  }, [filter, search]);

  async function loadArtifacts() {
    const params = new URLSearchParams();
    params.set("filter", filter);
    if (search.trim()) params.set("search", search.trim());
    const res = await fetch(`/api/artifacts?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setArtifacts(data.artifacts || []);
    }
  }

  async function handleCreateArtifact(type: "DOCUMENT" | "HTML" | "WHITEBOARD") {
    setNewMenuOpen(false);
    const title =
      type === "DOCUMENT"
        ? "Untitled Cloud Document"
        : type === "WHITEBOARD"
        ? "Architecture Whiteboard Canvas"
        : "Interactive Workspace Dashboard Artifact";
    const res = await fetch("/api/artifacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        type: type === "WHITEBOARD" ? "HTML" : type,
        content:
          type === "DOCUMENT"
            ? `<h1>${title}</h1><p>Draft specifications, memos, and collaborative docs with your Teamily AI agents.</p>`
            : type === "WHITEBOARD"
            ? `<div style="padding:24px;border-radius:16px;background:#f6f8f5;border:2px dashed #087c45"><h2 style="color:#087c45;margin:0 0 8px 0">🎨 Collaborative Whiteboard Canvas</h2><p style="margin:0;color:#56665c">System architecture nodes, sticky notes, and multi-agent flow diagrams.</p></div>`
            : `<div style="padding:20px;border-radius:16px;background:#f6f8f5;border:1px solid #dde6e0"><h2 style="color:#087c45;margin:0 0 8px 0">Interactive KPI Dashboard Artifact</h2><p style="margin:0;color:#56665c">Live HTML/CSS Deliverable generated in Teamily Studio.</p></div>`,
      }),
    });
    const data = await res.json();
    if (res.ok && data.artifact) {
      router.push(`/tiptap/${data.artifact.id}`);
    }
  }

  async function handleToggleFavorite(item: ArtifactItem) {
    await fetch(`/api/artifacts/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorited: !item.isFavorited }),
    });
    await loadArtifacts();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/artifacts/${id}`, { method: "DELETE" });
    await loadArtifacts();
  }

  return (
    <WorkspaceShell>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teamily pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#087c45]">
                <FileCode2 className="h-4 w-4" />
                <span>ARTIFACTS & CLOUD DOCUMENTS</span>
              </div>
              <h1 className="mt-1 text-2xl font-extrabold">
                Deliverables, Cloud Docs & Prototypes
              </h1>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNewMenuOpen(!newMenuOpen)}
                data-testid="artifacts-new-button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#066a3b]"
              >
                <Plus className="h-4 w-4" />
                + New
              </button>

              {newMenuOpen && (
                <div className="absolute right-0 top-12 z-40 w-60 rounded-2xl border border-teamily bg-teamily-main p-1.5 shadow-xl text-xs space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleCreateArtifact("DOCUMENT")}
                    data-testid="create-cloud-document-button"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 font-semibold hover:bg-teamily-subtle"
                  >
                    <FileText className="h-4 w-4 text-[#087c45]" />
                    Cloud Document (TipTap)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateArtifact("WHITEBOARD")}
                    data-testid="create-whiteboard-button"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 font-semibold hover:bg-teamily-subtle"
                  >
                    <FileCode2 className="h-4 w-4 text-[#087c45]" />
                    Whiteboard Canvas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateArtifact("HTML")}
                    data-testid="create-html-artifact-button"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 font-semibold hover:bg-teamily-subtle"
                  >
                    <Code className="h-4 w-4 text-[#087c45]" />
                    Interactive HTML Artifact
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Filter Pills + Search */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "ALL", label: "All" },
                { id: "FAVORITES", label: "Favorites" },
                { id: "DOCUMENTS", label: "Cloud Documents" },
                { id: "ARTIFACTS", label: "Code & HTML Artifacts" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id as typeof filter)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    filter === f.id
                      ? "bg-[#ddf3e5] text-[#087c45]"
                      : "bg-teamily-surface text-teamily-secondary hover:text-teamily-primary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-teamily-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deliverables..."
                className="w-full rounded-xl border border-teamily bg-teamily-surface pl-9 pr-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Artifacts Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {artifacts.map((art) => (
              <div
                key={art.id}
                className="flex flex-col justify-between rounded-2xl border border-teamily bg-teamily-surface p-5 hover:border-[#087c45]/60 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-md bg-[#ddf3e5] px-2.5 py-0.5 text-[10px] font-bold text-[#087c45]">
                      {art.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(art)}
                        className={`rounded-lg p-1.5 ${
                          art.isFavorited ? "text-amber-500" : "text-teamily-secondary"
                        }`}
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(art.id)}
                        className="rounded-lg p-1.5 text-teamily-secondary hover:text-[#ff5260]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Link href={`/tiptap/${art.id}`} className="hover:underline">
                    <h3 className="font-bold text-base leading-snug">{art.title}</h3>
                  </Link>
                  <p className="mt-2 text-xs text-teamily-secondary line-clamp-3">
                    {art.previewText || "Cloud document deliverable"}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-teamily flex items-center justify-between text-xs">
                  <span className="text-teamily-secondary">
                    {new Date(art.updatedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/tiptap/${art.id}`}
                    className="inline-flex items-center gap-1 font-bold text-[#087c45] hover:underline"
                  >
                    Open Editor <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
