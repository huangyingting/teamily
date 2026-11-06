"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SettingsLayout } from "@/components/SettingsLayout";
import { useTheme } from "@/components/Providers";
import { Sun, Moon, Monitor, ShieldCheck, Save } from "lucide-react";

export default function SettingsAccountPage() {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [plan, setPlan] = useState("Free");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setName(d.profile.name || "");
          setHandle(d.profile.handle || "");
          setEmail(d.profile.email || "");
          setRole(d.profile.role || "MEMBER");
          setPlan(d.profile.plan || "Free");
          setBio(d.profile.bio || "");
        }
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, handle, bio, themePreference: theme }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">Account & Appearance</h1>
          <p className="text-xs text-teamily-secondary mt-1">
            Manage your workspace identity, theme preferences, and role permissions
          </p>
        </div>

        {/* Account Form */}
        <form
          onSubmit={handleSave}
          className="rounded-3xl border border-teamily bg-teamily-surface p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-teamily bg-teamily-main px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                Handle
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full rounded-xl border border-teamily bg-teamily-main px-3.5 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full rounded-xl border border-teamily bg-teamily-subtle px-3.5 py-2 text-sm opacity-75"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                RBAC Role
              </label>
              <div className="rounded-xl border border-teamily bg-teamily-main px-3.5 py-2 text-sm font-bold text-[#087c45]">
                {role}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                Current Tier
              </label>
              <div className="rounded-xl border border-teamily bg-teamily-main px-3.5 py-2 text-sm font-bold">
                {plan}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-teamily-secondary mb-1">
              Workspace Bio & Agent Context
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-teamily bg-teamily-main p-3 text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-5 py-2 text-xs font-bold text-white hover:bg-[#066a3b]"
            >
              <Save className="h-3.5 w-3.5" />
              {saved ? "Saved ✓" : "Save Account"}
            </button>
          </div>
        </form>

        {/* Theme Switcher */}
        <div className="rounded-3xl border border-teamily bg-teamily-surface p-6">
          <h2 className="text-base font-bold">Appearance & Theme</h2>
          <p className="text-xs text-teamily-secondary mt-1">
            Switch between Teamily Light, Dark, or System appearance
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Monitor },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id as "light" | "dark" | "system")}
                  className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold transition ${
                    theme === item.id
                      ? "border-[#087c45] bg-[#ddf3e5] text-[#087c45]"
                      : "border-teamily bg-teamily-main text-teamily-secondary hover:text-teamily-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Security & Invites Quick Banner */}
        <div className="rounded-3xl border border-[#087c45]/30 bg-[#ddf3e5]/50 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5 text-[#087c45]">
              <ShieldCheck className="h-4 w-4" />
              Invite-Only Access, RBAC Roles & Audit Logs
            </h3>
            <p className="text-xs text-teamily-secondary mt-1">
              Generate single-use invitation codes, manage user roles, revoke sessions, and inspect security audit logs.
            </p>
          </div>
          <Link
            href="/settings/security"
            className="rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white shrink-0"
          >
            Open Security Console →
          </Link>
        </div>
      </div>
    </SettingsLayout>
  );
}
