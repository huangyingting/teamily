"use client";

import React, { useState } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Search, BookOpen, ShieldCheck, Zap, Brain, Users } from "lucide-react";

const HELP_ARTICLES = [
  {
    category: "Getting Started & Invites",
    icon: ShieldCheck,
    q: "How do invite-only registration and single-use invitation codes work?",
    a: "Teamily AI uses invite-only registration to protect workspace quality and security. Each invitation code is cryptographically generated, supports a maximum usage limit (single-use by default), optional email binding, an expiration timestamp, and an assigned RBAC role (ADMIN, MODERATOR, MEMBER, or VIEWER). Administrators can revoke unused codes or active user sessions at any time from Settings -> Security & Invites.",
  },
  {
    category: "Multi-Agent Chat",
    icon: Users,
    q: "What is the difference between Auto, Instant, and Agentic chat modes?",
    a: "In Chat, you can switch the composer mode selector between Auto (intelligent routing, 5 credits), Instant (low-latency fast response, 2 credits), and Agentic (multi-step reasoning with Living Wiki synthesis and artifact creation, 12 credits).",
  },
  {
    category: "Automations",
    icon: Zap,
    q: "How do I customize a scheduled Work or Life Automation?",
    a: "Navigate to Discover -> Agents -> Automations and click any template card. The Automation Composer Modal lets you click inline green parameter chips to cycle options, adjust the schedule (daily, weekly, monthly, or once), pick your delivery time, and save or trigger immediately.",
  },
  {
    category: "Memory & Living Wiki",
    icon: Brain,
    q: "How does the Living Wiki share memory across my agents?",
    a: "Every page inside Memory -> Wiki is indexed into your workspace Knowledge Graph. When you chat with your Personal Agent or a Multi-Agent Group, they reference your Living Wiki pages and can append new decisions or Next Actions automatically.",
  },
  {
    category: "Artifacts & Cloud Docs",
    icon: BookOpen,
    q: "How do I create or edit a TipTap Cloud Document?",
    a: "Go to Artifacts and click '+ New -> Cloud Document', or ask any agent in Chat to generate a spec or dashboard artifact. Clicking any document opens the full `/tiptap/[id]` rich-text editor with instant saving and HTML/Markdown preview.",
  },
];

export default function HelpCenterPage() {
  const [query, setQuery] = useState("");

  const filtered = HELP_ARTICLES.filter(
    (item) =>
      item.q.toLowerCase().includes(query.toLowerCase()) ||
      item.a.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />

      <main className="flex-1 py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="rounded-full bg-[#ddf3e5] px-3.5 py-1 text-xs font-bold text-[#087c45]">
              TEAMILY HELP CENTER
            </span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">
              Guides, Architecture & Workspace FAQ
            </h1>
            <div className="mt-6 max-w-xl mx-auto relative">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-teamily-secondary" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guides (e.g. invite codes, automations, living wiki)..."
                className="w-full rounded-2xl border border-teamily bg-teamily-surface pl-11 pr-4 py-3 text-sm focus:border-[#087c45] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-teamily bg-teamily-surface p-6"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#087c45] mb-1.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.category}</span>
                  </div>
                  <h2 className="text-base font-bold">{item.q}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-teamily-secondary">
                    {item.a}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
