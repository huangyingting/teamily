"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Bold,
  Heading1,
  Heading2,
  List,
  Code,
  Eye,
} from "lucide-react";

export default function TipTapCloudDocPage() {
  const params = useParams<{ id: string }>();
  const [title, setTitle] = useState("Loading Document...");
  const [content, setContent] = useState("");
  const [type, setType] = useState("DOCUMENT");
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/artifacts/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.artifact) {
          setTitle(d.artifact.title);
          setContent(d.artifact.content);
          setType(d.artifact.type);
        }
      });
  }, [params?.id]);

  async function handleSave() {
    if (!params?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/artifacts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  function insertSnippet(snippet: string) {
    setContent((prev) => `${prev}\n${snippet}`);
  }

  function handleAiExpand() {
    setContent(
      (prev) =>
        `${prev}\n<h2>AI Agent Synthesis (${new Date().toLocaleTimeString()})</h2><p>Expanded by <strong>Teamily Personal Agent</strong>: Prioritized key execution milestones, linked Living Wiki context, and verified deliverable readiness.</p>`
    );
  }

  return (
    <WorkspaceShell>
      <div className="flex flex-1 flex-col h-full overflow-hidden bg-teamily-main">
        {/* Top Editor Bar */}
        <header className="flex items-center justify-between border-b border-teamily px-6 py-3.5 bg-teamily-surface">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link
              href="/artifacts"
              className="rounded-xl border border-teamily bg-teamily-main p-2 text-teamily-secondary hover:text-teamily-primary"
              title="Back to Artifacts"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="tiptap-title-input"
              className="w-full max-w-lg rounded-xl border border-transparent hover:border-teamily focus:border-[#087c45] bg-transparent px-2.5 py-1 text-base font-extrabold focus:outline-none"
            />
            <span className="hidden sm:inline-block rounded-md bg-[#ddf3e5] px-2 py-0.5 text-[10px] font-bold text-[#087c45]">
              {type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAiExpand}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#087c45]/40 bg-[#ddf3e5] px-3 py-1.5 text-xs font-bold text-[#087c45]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Expand
            </button>

            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-teamily bg-teamily-main px-3 py-1.5 text-xs font-semibold"
            >
              <Eye className="h-3.5 w-3.5" />
              {previewMode ? "Edit Source" : "Rendered View"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              data-testid="tiptap-save-button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#066a3b]"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : savedToast ? "Saved ✓" : "Save"}
            </button>
          </div>
        </header>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1.5 border-b border-teamily px-6 py-2 bg-teamily-main text-xs">
          <button
            type="button"
            onClick={() => insertSnippet("<h1>Section Heading</h1>")}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 hover:bg-teamily-subtle"
          >
            <Heading1 className="h-3.5 w-3.5" /> H1
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("<h2>Subheading</h2>")}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 hover:bg-teamily-subtle"
          >
            <Heading2 className="h-3.5 w-3.5" /> H2
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("<strong>Key takeaway</strong>")}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 hover:bg-teamily-subtle"
          >
            <Bold className="h-3.5 w-3.5" /> Bold
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("<ul><li>Action item 1</li><li>Action item 2</li></ul>")}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 hover:bg-teamily-subtle"
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("<pre><code>// Code snippet</code></pre>")}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 hover:bg-teamily-subtle"
          >
            <Code className="h-3.5 w-3.5" /> Code
          </button>
        </div>

        {/* Main Cloud Document Canvas */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="mx-auto max-w-3xl">
            {previewMode ? (
              <div
                className="prose max-w-none rounded-3xl border border-teamily bg-teamily-surface p-8 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <textarea
                rows={22}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                data-testid="tiptap-editor-textarea"
                className="w-full rounded-3xl border border-teamily bg-teamily-surface p-6 font-mono text-xs sm:text-sm leading-relaxed focus:border-[#087c45] focus:outline-none"
              />
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
