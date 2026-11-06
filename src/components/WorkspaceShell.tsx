"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "./Providers";
import {
  MessageSquare,
  Compass,
  Brain,
  FileCode2,
  Coins,
  UserPlus,
  Settings,
  Sun,
  Moon,
  LogOut,
  User,
  ShieldCheck,
  Copy,
  Check,
  X,
  Plus,
} from "lucide-react";

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteHours, setInviteHours] = useState(168);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const user = session?.user;

  const navItems = [
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/memory", label: "Memory", icon: Brain },
    { href: "/artifacts", label: "Artifacts", icon: FileCode2 },
  ];

  async function handleGenerateQuickInvite() {
    setCreatingInvite(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedRole: inviteRole,
          maxUses: 1,
          expiresInHours: inviteHours,
          note: "Workspace sidebar quick invite",
        }),
      });
      const data = await res.json();
      if (res.ok && data.invite?.code) {
        setGeneratedCode(data.invite.code);
      }
    } finally {
      setCreatingInvite(false);
    }
  }

  function copyInviteCode(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-teamily-main text-teamily-primary">
      {/* Left Primary Navigation Rail (Desktop & Tablet) */}
      <aside className="hidden md:flex w-[72px] shrink-0 flex-col items-center justify-between border-r border-teamily bg-teamily-surface py-4 z-30">
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/chat"
            title="Teamily AI Workspace"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#087c45] text-white text-xl shadow-sm hover:bg-[#066a3b] transition"
          >
            🌿
          </Link>

          <nav className="flex flex-col items-center gap-2 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex flex-col items-center justify-center w-14 py-2 rounded-xl transition ${
                    active
                      ? "bg-[#ddf3e5] text-[#087c45] font-semibold"
                      : "text-teamily-secondary hover:bg-teamily-subtle hover:text-teamily-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="mt-1 text-[10px] leading-none">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Actions */}
        <div className="flex flex-col items-center gap-2.5 relative">
          <Link
            href="/settings/credits-center"
            title="Credits Center"
            className="flex flex-col items-center justify-center w-14 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition"
          >
            <Coins className="h-4 w-4" />
            <span className="mt-0.5 text-[10px] font-semibold">
              {user?.credits ?? 500}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            title="Invite Collaborators"
            className="flex flex-col items-center justify-center w-14 py-1.5 rounded-xl text-teamily-secondary hover:bg-teamily-subtle hover:text-teamily-primary transition"
          >
            <UserPlus className="h-4 w-4" />
            <span className="mt-0.5 text-[10px]">Invite</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            title="Toggle Dark / Light Theme"
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-teamily-secondary hover:bg-teamily-subtle hover:text-teamily-primary transition"
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {(user?.role === "ADMIN" || user?.role === "MODERATOR") && (
            <Link
              href="/settings/security"
              title="Security, Invites & Audit Logs"
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                pathname?.startsWith("/settings/security")
                  ? "bg-[#ddf3e5] text-[#087c45]"
                  : "text-teamily-secondary hover:bg-teamily-subtle hover:text-teamily-primary"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
            </Link>
          )}

          <Link
            href="/settings"
            title="Settings"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
              pathname === "/settings"
                ? "bg-[#ddf3e5] text-[#087c45]"
                : "text-teamily-secondary hover:bg-teamily-subtle hover:text-teamily-primary"
            }`}
          >
            <Settings className="h-4 w-4" />
          </Link>

          {/* User Avatar + Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              data-testid="user-profile-button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#087c45] text-white font-bold text-sm shadow-sm hover:ring-2 hover:ring-[#087c45]/40 transition"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </button>

            {profileMenuOpen && (
              <div className="absolute bottom-0 left-14 w-64 rounded-2xl border border-teamily bg-teamily-main p-3 shadow-xl z-50">
                <div className="border-b border-teamily pb-2.5 mb-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm truncate">{user?.name || "Workspace Member"}</p>
                    <span className="rounded-md bg-[#ddf3e5] px-1.5 py-0.5 text-[10px] font-bold text-[#087c45]">
                      {user?.role || "MEMBER"}
                    </span>
                  </div>
                  <p className="text-xs text-teamily-secondary truncate">@{user?.handle || "member"}</p>
                  <p className="text-[11px] text-teamily-secondary truncate mt-0.5">{user?.email}</p>
                </div>

                <div className="space-y-1 text-xs">
                  <Link
                    href={`/profile/${user?.id || "me"}`}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-teamily-subtle"
                  >
                    <User className="h-3.5 w-3.5" />
                    My Profile
                  </Link>
                  <Link
                    href="/settings/credits-center"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-teamily-subtle"
                  >
                    <span className="flex items-center gap-2">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      Credits ({user?.plan || "Free"})
                    </span>
                    <span className="font-semibold">{user?.credits ?? 500}</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-teamily-subtle"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Workspace Settings
                  </Link>
                  {(user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                    <Link
                      href="/settings/security"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[#087c45] font-medium hover:bg-teamily-subtle"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Security, Invites & Audit
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      setProfileMenuOpen(false);
                      await signOut({ redirect: false });
                      router.push("/login");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[#ff5260] hover:bg-red-500/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden pb-14 md:pb-0">
        {children}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden items-center justify-around border-t border-teamily bg-teamily-surface py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center px-3 py-1 rounded-lg text-xs ${
                active ? "text-[#087c45] font-semibold" : "text-teamily-secondary"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={`flex flex-col items-center px-3 py-1 rounded-lg text-xs ${
            pathname?.startsWith("/settings") ? "text-[#087c45] font-semibold" : "text-teamily-secondary"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Settings</span>
        </Link>
      </nav>

      {/* Invite Collaborators & Single-Use Code Generator Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-teamily bg-teamily-main p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-teamily pb-3">
              <div>
                <h3 className="text-lg font-bold">Invite to Teamily AI</h3>
                <p className="text-xs text-teamily-secondary">
                  Generate a single-use, expiring invitation code with role-based access
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-lg p-1.5 text-teamily-secondary hover:bg-teamily-subtle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-teamily-secondary mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full rounded-xl border border-teamily bg-teamily-surface px-3 py-2 text-sm"
                  >
                    <option value="MEMBER">MEMBER (Standard)</option>
                    <option value="VIEWER">VIEWER (Read-Only)</option>
                    {user?.role === "ADMIN" && (
                      <>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-teamily-secondary mb-1">
                    Expiration
                  </label>
                  <select
                    value={inviteHours}
                    onChange={(e) => setInviteHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-teamily bg-teamily-surface px-3 py-2 text-sm"
                  >
                    <option value={24}>24 Hours</option>
                    <option value={72}>3 Days</option>
                    <option value={168}>7 Days</option>
                    <option value={720}>30 Days</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={creatingInvite}
                onClick={handleGenerateQuickInvite}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087c45] py-2.5 text-sm font-semibold text-white hover:bg-[#066a3b] disabled:opacity-50 transition"
              >
                <Plus className="h-4 w-4" />
                {creatingInvite ? "Generating Code..." : "Generate Single-Use Invite Code"}
              </button>

              {generatedCode && (
                <div className="rounded-xl border border-[#087c45]/30 bg-[#ddf3e5]/50 p-3.5">
                  <p className="text-xs font-medium text-[#087c45]">
                    Single-Use Invitation Code Ready:
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <code className="font-mono text-lg font-bold tracking-widest text-teamily-primary">
                      {generatedCode}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyInviteCode(generatedCode)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#087c45] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy Code"}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-teamily text-xs text-teamily-secondary">
                <span>Earn 200 bonus credits per invited builder</span>
                <Link
                  href="/settings/security"
                  onClick={() => setInviteOpen(false)}
                  className="font-semibold text-[#087c45] hover:underline"
                >
                  Manage All Invites →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
