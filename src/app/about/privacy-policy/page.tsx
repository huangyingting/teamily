import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Lock } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />
      <main className="flex-1 py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ddf3e5] px-3.5 py-1 text-xs font-bold text-[#087c45]">
            <Lock className="h-3.5 w-3.5" />
            PRIVACY & DATA PROTECTION
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-teamily-secondary">
            Last Updated: November 2026 • Teamily, Inc.
          </p>

          <div className="mt-8 space-y-6 rounded-3xl border border-teamily bg-teamily-surface p-6 sm:p-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold">1. Private Living Wiki & 7 Life Goals</h2>
              <p className="mt-2 text-xs text-teamily-secondary leading-relaxed">
                Your Living Wiki knowledge graph, Next Actions, Meeting transcripts, and 7 Private Life Goals are scoped strictly to your workspace and are never shared publicly unless you explicitly publish an Artifact to the Discover Community Feed.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">2. Encrypted Skill Keys & App Connectors</h2>
              <p className="mt-2 text-xs text-teamily-secondary leading-relaxed">
                Third-party skill keys configured in Skill Configuration and OAuth tokens in App Connectors are used solely during authorized agent tool executions and are never exposed in chat transcripts.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">3. Local AI & Desktop Runtime Privacy</h2>
              <p className="mt-2 text-xs text-teamily-secondary leading-relaxed">
                When using Teamily Desktop Local AI or connected coding runtimes (Claude Code, Codex), local repository files execute on your machine according to your configured runtime permissions.
              </p>
            </section>

            <div className="pt-4 border-t border-teamily flex flex-wrap gap-4 text-xs font-semibold text-[#087c45]">
              <Link href="/about/terms-of-service" className="hover:underline">
                Terms of Service →
              </Link>
              <Link href="/about/open-source" className="hover:underline">
                Open Source Licenses →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
