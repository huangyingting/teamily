"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import {
  AGENT_TEAMS,
  AUTOMATION_TEMPLATES,
  OFFICIAL_AGENTS,
  SHOWCASE_COMMUNITY_POSTS,
} from "@/lib/catalog";
import { Sparkles, Users, Zap, MessageSquare, ArrowRight } from "lucide-react";

export default function PublicExplorePage() {
  const [tab, setTab] = useState<"feed" | "agents" | "teams" | "automations">("feed");

  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-teamily pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ddf3e5] px-3 py-1 text-xs font-bold text-[#087c45]">
                <Sparkles className="h-3.5 w-3.5" />
                DISCOVER TEAMILY ECOSYSTEM
              </span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
                Explore Agent Teams, Workflows & Community Showcases
              </h1>
            </div>

            <div className="flex flex-wrap gap-1.5 rounded-2xl bg-teamily-surface p-1.5 border border-teamily text-xs font-semibold">
              {[
                { id: "feed", label: "Community Feed" },
                { id: "agents", label: "Specialist Agents" },
                { id: "teams", label: "Agent Teams" },
                { id: "automations", label: "Automations" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id as typeof tab)}
                  className={`rounded-xl px-3.5 py-2 transition ${
                    tab === t.id
                      ? "bg-[#087c45] text-white"
                      : "text-teamily-secondary hover:text-teamily-primary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === "feed" && (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {SHOWCASE_COMMUNITY_POSTS.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col justify-between rounded-2xl border border-teamily bg-teamily-surface p-6 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-teamily-secondary mb-3">
                      <span className="font-semibold text-[#087c45]">{post.category}</span>
                      <span>{post.authorHandle}</span>
                    </div>
                    <h2 className="text-lg font-bold leading-snug">{post.title}</h2>
                    <p className="mt-2 text-xs text-teamily-secondary leading-relaxed">
                      {post.summary}
                    </p>
                    <div className="mt-4 rounded-xl bg-teamily-main border border-teamily p-3 font-mono text-[11px] text-teamily-secondary">
                      “{post.promptSnippet}”
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-teamily flex items-center justify-between text-xs">
                    <span className="text-teamily-secondary">
                      ❤️ {post.likesCount} • 💬 {post.commentsCount}
                    </span>
                    <Link
                      href={`/post/${post.id}`}
                      className="font-semibold text-[#087c45] hover:underline inline-flex items-center gap-1"
                    >
                      Read Workflow <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "agents" && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OFFICIAL_AGENTS.map((agent) => (
                <div
                  key={agent.slug}
                  className="rounded-2xl border border-teamily bg-teamily-surface p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl text-white"
                        style={{ backgroundColor: agent.avatarBg }}
                      >
                        {agent.avatarEmoji}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm">{agent.name}</h3>
                        <p className="text-xs text-teamily-secondary">{agent.title}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-teamily-secondary">{agent.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-teamily flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#087c45]">
                      {agent.category}
                    </span>
                    <Link
                      href="/chat"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#087c45] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Chat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "teams" && (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {AGENT_TEAMS.map((team) => (
                <div
                  key={team.id}
                  className="rounded-2xl border border-teamily bg-teamily-surface p-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#087c45]" />
                      {team.name}
                    </h3>
                    <span className="rounded-full bg-[#ddf3e5] px-2.5 py-0.5 text-[10px] font-bold text-[#087c45]">
                      {team.category}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-teamily-secondary">{team.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {team.members.map((m) => (
                      <span
                        key={m.name}
                        className="rounded-lg border border-teamily bg-teamily-main px-2.5 py-1 text-xs font-medium"
                      >
                        {m.emoji} {m.name} • <span className="text-teamily-secondary">{m.role}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "automations" && (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {AUTOMATION_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-2xl border border-teamily bg-teamily-surface p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{tpl.icon}</span>
                      <div>
                        <h3 className="font-bold text-sm">{tpl.title}</h3>
                        <p className="text-[11px] text-teamily-secondary">
                          {tpl.category} • {tpl.subCategory}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#ddf3e5] px-2.5 py-1 text-[11px] font-bold text-[#087c45]">
                      <Zap className="h-3 w-3" /> {tpl.defaultSchedule}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-teamily-secondary">{tpl.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
