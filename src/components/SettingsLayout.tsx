"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WorkspaceShell } from "./WorkspaceShell";
import {
  User,
  CreditCard,
  Coins,
  BarChart3,
  ShieldCheck,
  Radio,
  Bot,
  Puzzle,
  Plug,
  Terminal,
  Sparkles,
  Share2,
} from "lucide-react";

const SETTINGS_NAV = [
  { href: "/settings", label: "Account", icon: User },
  { href: "/settings/subscription", label: "Subscription", icon: CreditCard },
  { href: "/settings/credits-center", label: "Credits Center", icon: Coins },
  { href: "/settings/usage", label: "Usage", icon: BarChart3 },
  { href: "/settings/security", label: "Security, Invites & Audit", icon: ShieldCheck },
  { href: "/settings/channels", label: "Channels", icon: Radio },
  { href: "/settings/agent-access", label: "Agent Access", icon: Bot },
  { href: "/settings/skill-configuration", label: "Skill Configuration", icon: Puzzle },
  { href: "/settings/connectors", label: "Connectors", icon: Plug },
  { href: "/settings/runtimes", label: "Runtimes", icon: Terminal },
  { href: "/settings/creator-center", label: "Creator Center", icon: Sparkles },
  { href: "/settings/affiliate", label: "Affiliate", icon: Share2 },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <WorkspaceShell>
      <div className="flex flex-1 h-full overflow-hidden">
        <aside className="w-60 shrink-0 border-r border-teamily bg-teamily-surface p-4 overflow-y-auto">
          <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-teamily-secondary mb-3">
            Workspace Settings
          </p>
          <nav className="space-y-1">
            {SETTINGS_NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-[#ddf3e5] text-[#087c45]"
                      : "text-teamily-secondary hover:bg-teamily-subtle hover:text-teamily-primary"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-teamily-main">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
    </WorkspaceShell>
  );
}
