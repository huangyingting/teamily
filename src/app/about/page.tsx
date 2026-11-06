import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Brain, Users, Zap, Shield, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <span className="rounded-full bg-[#ddf3e5] px-3.5 py-1 text-xs font-bold text-[#087c45]">
            OUR MISSION & VISION
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight">
            From Isolated AI Chats to Compounding Human + AI Teams
          </h1>
          <p className="mt-5 text-base leading-relaxed text-teamily-secondary">
            Most AI tools treat every prompt like a blank slate. You explain your context, get a single response, and lose that institutional memory the moment you close the tab.{" "}
            <strong>Teamily AI</strong> was built on a different premise: great work happens when specialist perspectives collaborate around a shared, living memory.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-teamily bg-teamily-surface p-6">
              <Users className="h-6 w-6 text-[#087c45] mb-3" />
              <h2 className="text-lg font-bold">1. Multi-Agent Perspectives</h2>
              <p className="mt-2 text-xs leading-relaxed text-teamily-secondary">
                Assemble specialist agents in a single room so product taste, engineering velocity, and macro risk analysis sharpen each other in real time.
              </p>
            </div>
            <div className="rounded-2xl border border-teamily bg-teamily-surface p-6">
              <Brain className="h-6 w-6 text-[#087c45] mb-3" />
              <h2 className="text-lg font-bold">2. The Living Wiki</h2>
              <p className="mt-2 text-xs leading-relaxed text-teamily-secondary">
                Your workspace maintains an evolving Knowledge Graph, structured Wiki pages, and Next Actions so your agents know your goals without repeating context.
              </p>
            </div>
            <div className="rounded-2xl border border-teamily bg-teamily-surface p-6">
              <Zap className="h-6 w-6 text-[#087c45] mb-3" />
              <h2 className="text-lg font-bold">3. Proactive Automations</h2>
              <p className="mt-2 text-xs leading-relaxed text-teamily-secondary">
                Instead of waiting for prompts, Teamily agents run scheduled Work & Life briefings, competitive radars, and evening reflections autonomously.
              </p>
            </div>
            <div className="rounded-2xl border border-teamily bg-teamily-surface p-6">
              <Shield className="h-6 w-6 text-[#087c45] mb-3" />
              <h2 className="text-lg font-bold">4. Enterprise-Grade Governance</h2>
              <p className="mt-2 text-xs leading-relaxed text-teamily-secondary">
                Built with invite-only single-use access codes, granular RBAC roles, instant session revocation, and immutable security audit logging.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-[#087c45]/30 bg-[#ddf3e5]/50 p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Need documentation or onboarding guides?</h3>
              <p className="text-xs text-teamily-secondary mt-1">
                Explore the Teamily Help Center for guides on Agent Teams, Automations, Living Wiki, and Invite Codes.
              </p>
            </div>
            <Link
              href="/about/help-center"
              className="inline-flex items-center gap-2 rounded-xl bg-[#087c45] px-5 py-2.5 text-xs font-bold text-white shrink-0"
            >
              Visit Help Center <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
