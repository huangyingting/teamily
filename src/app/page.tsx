import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import {
  AGENT_TEAMS,
  AUTOMATION_TEMPLATES,
  OFFICIAL_AGENTS,
  PLATFORM_CONNECTORS,
  PLATFORM_SKILLS,
} from "@/lib/catalog";
import { ArrowRight, Sparkles, Brain, Users, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-teamily py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#087c45]/30 bg-[#ddf3e5] px-4 py-1.5 text-xs font-bold text-[#087c45] mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              BUILD YOUR OWN AI AGENT TEAM • LIVING WIKI MEMORY
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl leading-[1.1]">
              Where Humans & Specialist{" "}
              <span className="text-[#087c45]">AI Agent Teams</span> Build Together.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-teamily-secondary">
              Go beyond single-chat prompts. Assemble multi-agent war rooms, schedule recurring Work & Life briefings, and compound every decision into a shared <strong>Living Wiki</strong>.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#087c45] px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#066a3b] transition"
              >
                Redeem Invite & Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-2xl border border-teamily bg-teamily-surface px-7 py-3.5 text-sm font-semibold hover:bg-teamily-subtle transition"
              >
                Explore 52+ Agent Teams & Workflows
              </Link>
            </div>

            {/* Interactive Preview Cards */}
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
              {[
                {
                  icon: Users,
                  title: "Multi-Agent Swarm Rooms",
                  desc: "Bring Ray, Steve, Elon, Aria, and Marcus into one group chat to debate strategy from multiple angles.",
                },
                {
                  icon: Brain,
                  title: "Living Wiki & Knowledge Graph",
                  desc: "Every conversation and meeting automatically updates your structured Living Wiki and Next Actions.",
                },
                {
                  icon: Zap,
                  title: "Scheduled Work & Life Automations",
                  desc: "Customize interactive chip prompts that run daily at 8:30 AM and deliver executive briefings.",
                },
                {
                  icon: ShieldCheck,
                  title: "Invite-Only RBAC & Audit Governance",
                  desc: "Single-use expiring invitation codes, role-based access control, session revocation, and audit logs.",
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-teamily bg-teamily-surface p-6 shadow-xs hover:border-[#087c45]/50 transition"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ddf3e5] text-[#087c45] mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-base">{card.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-teamily-secondary">
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Official Specialist Agents Showcase */}
        <section className="py-16 border-b border-teamily bg-teamily-surface/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#087c45]">
                  SPECIALIST AI ROSTER
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold">
                  Collaborate with Iconic Thinkers & Domain Leads
                </h2>
              </div>
              <Link
                href="/explore"
                className="text-sm font-semibold text-[#087c45] hover:underline"
              >
                View all Agents & Teams →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OFFICIAL_AGENTS.slice(0, 6).map((agent) => (
                <div
                  key={agent.slug}
                  className="rounded-2xl border border-teamily bg-teamily-main p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl text-white shadow-xs"
                        style={{ backgroundColor: agent.avatarBg }}
                      >
                        {agent.avatarEmoji}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm">{agent.name}</h3>
                        <p className="text-xs text-teamily-secondary line-clamp-1">
                          {agent.title}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-teamily-secondary leading-relaxed">
                      {agent.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-teamily flex flex-wrap gap-1.5">
                    {agent.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-teamily-subtle px-2 py-0.5 text-[10px] font-medium text-teamily-secondary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Agent Teams & Automations Preview */}
        <section className="py-16 border-b border-teamily">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#087c45]">
                  PRE-ASSEMBLED SQUADS
                </span>
                <h2 className="mt-1 text-2xl font-extrabold">
                  Multi-Agent War Rooms Ready in 1 Click
                </h2>
                <div className="mt-6 space-y-3">
                  {AGENT_TEAMS.slice(0, 4).map((team) => (
                    <div
                      key={team.id}
                      className="rounded-2xl border border-teamily bg-teamily-surface p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm">{team.name}</h3>
                        <span className="rounded-full bg-[#ddf3e5] px-2.5 py-0.5 text-[10px] font-bold text-[#087c45]">
                          {team.category}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-teamily-secondary">
                        {team.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        {team.members.map((m) => (
                          <span
                            key={m.name}
                            className="inline-flex items-center gap-1 rounded-lg bg-teamily-main border border-teamily px-2 py-1 text-[11px] font-medium"
                          >
                            <span>{m.emoji}</span>
                            <span>{m.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#087c45]">
                  AUTONOMOUS SCHEDULER
                </span>
                <h2 className="mt-1 text-2xl font-extrabold">
                  Work & Life Automations That Run While You Sleep
                </h2>
                <div className="mt-6 space-y-3">
                  {AUTOMATION_TEMPLATES.slice(0, 4).map((tpl) => (
                    <div
                      key={tpl.id}
                      className="rounded-2xl border border-teamily bg-teamily-surface p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{tpl.icon}</span>
                          <h3 className="font-bold text-sm">{tpl.title}</h3>
                        </div>
                        <span className="rounded-md bg-teamily-subtle px-2 py-0.5 text-[10px] font-semibold">
                          {tpl.defaultSchedule} • {tpl.defaultTime}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-teamily-secondary">
                        {tpl.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills & Connectors Banner */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Connected to Your Entire Knowledge & Engineering Stack
            </h2>
            <p className="mt-2 text-sm text-teamily-secondary">
              {PLATFORM_SKILLS.length} native AI skills and {PLATFORM_CONNECTORS.length} bi-directional workspace connectors
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {PLATFORM_CONNECTORS.map((c) => (
                <div
                  key={c.id}
                  className="inline-flex items-center gap-2 rounded-xl border border-teamily bg-teamily-surface px-4 py-2.5 text-xs font-semibold"
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#087c45]" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-teamily bg-teamily-surface py-10 text-xs text-teamily-secondary">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-teamily-primary">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#087c45] text-white">
              🌿
            </span>
            <span>Teamily AI</span>
            <span className="font-normal text-teamily-secondary">
              © 2026 Teamily AI Workspace. All rights reserved.
            </span>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link href="/pricing" className="hover:text-teamily-primary">Pricing</Link>
            <Link href="/download" className="hover:text-teamily-primary">Download</Link>
            <Link href="/explore" className="hover:text-teamily-primary">Explore</Link>
            <Link href="/about" className="hover:text-teamily-primary">About</Link>
            <Link href="/about/help-center" className="hover:text-teamily-primary">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
