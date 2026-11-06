import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import { ShieldCheck, FileText } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />
      <main className="flex-1 py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ddf3e5] px-3.5 py-1 text-xs font-bold text-[#087c45]">
            <FileText className="h-3.5 w-3.5" />
            LEGAL & GOVERNANCE
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-teamily-secondary">
            Effective Date: November 2026 • Teamily, Inc.
          </p>

          <div className="mt-8 space-y-6 rounded-3xl border border-teamily bg-teamily-surface p-6 sm:p-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold">1. Acceptance of Terms & Invite-Only Access</h2>
              <p className="mt-2 text-xs text-teamily-secondary leading-relaxed">
                By accessing or using Teamily AI, you agree to these Terms of Service. Workspace registration requires a valid single-use or expiring invitation code issued by a Workspace Administrator or authorized member.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">2. Autonomous Agents, Automations & Living Wiki</h2>
              <p className="mt-2 text-xs text-teamily-secondary leading-relaxed">
                You retain ownership of all documents, Living Wiki pages, Cloud Documents, and Artifacts created in your workspace. You are responsible for reviewing actions executed by scheduled Work & Life Automations, App Connectors, and Authorized AI Clients.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">3. Credits, Group Sponsorship & Subscriptions</h2>
              <p className="mt-2 text-xs text-teamily-secondary leading-relaxed">
                Plans include Free, Plus, Premium, and Pro tiers with 5-hour window and weekly usage allowances. In Multi-Agent Group chats, room creators may choose between &ldquo;Owner Pays&rdquo; (group sponsoring) and &ldquo;Members Pay&rdquo; billing modes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">4. Security, RBAC & Session Revocation</h2>
              <p className="mt-2 text-xs text-teamily-secondary leading-relaxed">
                Workspace Administrators may assign Role-Based Access Control (RBAC) roles, revoke unused invitation codes, or terminate active sessions at any time. All administrative and security events are recorded in the immutable Audit Log.
              </p>
            </section>

            <div className="pt-4 border-t border-teamily flex flex-wrap gap-4 text-xs font-semibold text-[#087c45]">
              <Link href="/about/privacy-policy" className="hover:underline">
                Privacy Policy →
              </Link>
              <Link href="/about/open-source" className="hover:underline">
                Open Source Licenses →
              </Link>
              <Link href="/about/help-center" className="hover:underline">
                Help Center →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
