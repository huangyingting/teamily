"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SettingsLayout } from "@/components/SettingsLayout";
import { FIRST_WEEK_ONBOARDING_TASKS } from "@/lib/catalog";
import {
  Coins,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  UserPlus,
  CheckCircle2,
  Trophy,
  Flame,
  Gift,
} from "lucide-react";

export default function CreditsCenterPage() {
  const [activeTab, setActiveTab] = useState<
    "onboarding" | "invite" | "leaderboard" | "my-credits"
  >("my-credits");
  const [credits, setCredits] = useState(500);
  const [dailyCredits, setDailyCredits] = useState(200);
  const [plan, setPlan] = useState("Free");
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // Invite Redemption State (matches Scenario 6 on original website)
  const [redeemCodeInput, setRedeemCodeInput] = useState("");
  const [redeemStatus, setRedeemStatus] = useState<{
    type: "idle" | "error" | "success";
    message: string;
  }>({ type: "idle", message: "" });

  // Leaderboard period toggle
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"Daily" | "Weekly">("Daily");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const t = sp.get("tab");
      if (t === "onboarding" || t === "invite" || t === "leaderboard" || t === "my-credits") {
        setActiveTab(t);
      }
    }
    loadCredits();
  }, []);

  async function loadCredits() {
    const res = await fetch("/api/settings");
    if (!res.ok) return;
    const data = await res.json();
    if (data.user) {
      setCredits(data.user.credits);
      setDailyCredits(data.user.dailyCredits);
      setPlan(data.user.plan);
    }
  }

  async function handleClaimDaily() {
    setClaiming(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimDailyRefresh: true }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCredits(data.user.credits);
        setClaimed(true);
      }
    } finally {
      setClaiming(false);
    }
  }

  async function handleRedeemInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!redeemCodeInput.trim()) return;
    setRedeemStatus({ type: "idle", message: "" });
    const res = await fetch("/api/invites/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: redeemCodeInput.trim() }),
    });
    const data = await res.json();
    if (!res.ok || !data.valid) {
      setRedeemStatus({
        type: "error",
        message: data.message || "Invalid invite code",
      });
    } else {
      setRedeemStatus({
        type: "success",
        message: `Invite code ${data.invite.code} verified (+200 bonus credits unlocked)!`,
      });
    }
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Credits Center</h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Complete first-week onboarding tasks, redeem invite codes, climb the AI leaderboard, and manage compute credits
            </p>
          </div>
          <Link
            href="/settings/subscription"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white"
          >
            Upgrade Plan <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4 Tabs Navigation */}
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-teamily bg-teamily-surface p-1.5 text-xs font-bold">
          {[
            { id: "onboarding", label: "Onboarding & Streak", icon: Flame },
            { id: "invite", label: "Invite & Redeem", icon: Gift },
            { id: "leaderboard", label: "Leaderboard", icon: Trophy },
            { id: "my-credits", label: "My Credits", icon: Coins },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                data-testid={`credits-tab-${t.id}`}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 transition ${
                  activeTab === t.id
                    ? "bg-[#087c45] text-white"
                    : "text-teamily-secondary hover:text-teamily-primary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ONBOARDING & 3-DAY LOGIN STREAK */}
        {activeTab === "onboarding" && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-[#087c45]/30 bg-[#ddf3e5]/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087c45]">
                  <Flame className="h-4 w-4" /> 3-DAY CONSECUTIVE LOGIN STREAK
                </span>
                <h2 className="mt-1 text-lg font-extrabold">
                  Day 1 of 3 Active Streak (+150 Bonus Credits on Day 3)
                </h2>
                <p className="text-xs text-teamily-secondary mt-0.5">
                  Check in daily and run at least 1 Personal Agent turn to keep your streak alive.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((d) => (
                  <div
                    key={d}
                    className={`rounded-2xl border px-4 py-2.5 text-center text-xs font-bold ${
                      d === 1
                        ? "border-[#087c45] bg-[#087c45] text-white"
                        : "border-teamily bg-teamily-main text-teamily-secondary"
                    }`}
                  >
                    Day {d} {d === 1 ? "✓" : ""}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-teamily bg-teamily-surface p-6 space-y-3">
              <h2 className="text-base font-bold">
                7 First-Week Onboarding Milestones
              </h2>
              {FIRST_WEEK_ONBOARDING_TASKS.map((task) => (
                <div
                  key={task.dayNumber}
                  className="flex items-center justify-between rounded-2xl border border-teamily bg-teamily-main p-4 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#087c45] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">
                        Day {task.dayNumber}: {task.title}
                      </p>
                      <p className="text-teamily-secondary mt-0.5">{task.description}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#ddf3e5] px-3 py-1 font-bold text-[#087c45]">
                    +200 Credits
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: INVITE & REDEEM CODE */}
        {activeTab === "invite" && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-teamily bg-teamily-surface p-6">
              <h2 className="text-base font-bold">Redeem an Invitation / Bonus Code</h2>
              <p className="text-xs text-teamily-secondary mt-1">
                Have a friend or admin invitation code? Verify or redeem it below to unlock bonus compute credits.
              </p>

              <form onSubmit={handleRedeemInvite} className="mt-4 flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  data-testid="credits-invite-input"
                  value={redeemCodeInput}
                  onChange={(e) => setRedeemCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  className="flex-1 rounded-xl border border-teamily bg-teamily-main px-3.5 py-2.5 text-sm font-mono uppercase tracking-wider"
                />
                <button
                  type="submit"
                  data-testid="credits-invite-redeem"
                  className="rounded-xl bg-[#087c45] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#066a3b]"
                >
                  Redeem
                </button>
              </form>

              {redeemStatus.type === "error" && (
                <div
                  data-testid="credits-invite-error"
                  className="mt-3 rounded-xl border border-[#ff5260]/40 bg-[#ff5260]/10 px-4 py-2.5 text-xs font-semibold text-[#ff5260]"
                >
                  {redeemStatus.message}
                </div>
              )}

              {redeemStatus.type === "success" && (
                <div
                  data-testid="credits-invite-success"
                  className="mt-3 rounded-xl border border-[#087c45]/40 bg-[#ddf3e5] px-4 py-2.5 text-xs font-semibold text-[#087c45]"
                >
                  {redeemStatus.message}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-teamily bg-teamily-surface p-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Issue Single-Use & Expiring Workspace Invites</h3>
                <p className="text-xs text-teamily-secondary mt-0.5">
                  Manage single-use codes, role assignments, revocation, and redemption history in the Security Console.
                </p>
              </div>
              <Link
                href="/settings/security"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Open Invite Console →
              </Link>
            </div>
          </div>
        )}

        {/* TAB 3: LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <div className="rounded-3xl border border-teamily bg-teamily-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Autonomous Builder Leaderboard</h2>
                <p className="text-xs text-teamily-secondary">
                  Ranked by multi-agent workflows executed and artifacts remixed
                </p>
              </div>
              <div className="flex rounded-xl bg-teamily-main p-1 text-xs font-semibold border border-teamily">
                {(["Daily", "Weekly"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setLeaderboardPeriod(p)}
                    className={`rounded-lg px-3 py-1 ${
                      leaderboardPeriod === p ? "bg-[#087c45] text-white" : "text-teamily-secondary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { rank: 1, name: "Swarm Architect Guild", runs: 142, creditsEarned: "+1,200" },
                { rank: 2, name: "Deep Research Collective", runs: 118, creditsEarned: "+800" },
                { rank: 3, name: "Growth & GTM Studio", runs: 94, creditsEarned: "+500" },
              ].map((row) => (
                <div
                  key={row.rank}
                  className="flex items-center justify-between rounded-2xl border border-teamily bg-teamily-main p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ddf3e5] font-extrabold text-[#087c45]">
                      #{row.rank}
                    </span>
                    <div>
                      <p className="font-bold">{row.name}</p>
                      <p className="text-[10px] text-teamily-secondary">
                        {row.runs} agentic runs ({leaderboardPeriod})
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#087c45]">{row.creditsEarned} Credits</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MY CREDITS */}
        {activeTab === "my-credits" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-teamily bg-teamily-surface p-6">
                <p className="text-xs font-bold uppercase text-teamily-secondary">
                  Available Credit Balance
                </p>
                <p
                  data-testid="credits-balance-value"
                  className="mt-2 text-4xl font-extrabold text-[#087c45] flex items-center gap-2"
                >
                  <Coins className="h-7 w-7 text-amber-500" />
                  {credits.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-teamily-secondary">Active Plan: {plan}</p>
              </div>

              <div className="rounded-3xl border border-teamily bg-teamily-surface p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-teamily-secondary">
                    Daily Refresh Credits
                  </p>
                  <p className="mt-2 text-2xl font-extrabold">+{dailyCredits} / day</p>
                  <p className="mt-1 text-xs text-teamily-secondary">
                    Refreshes every 24 hours for Auto & Instant turns
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="claim-daily-credits-button"
                  disabled={claiming || claimed}
                  onClick={handleClaimDaily}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#ddf3e5] py-2 text-xs font-bold text-[#087c45] hover:bg-[#087c45] hover:text-white disabled:opacity-50 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {claimed ? "Claimed +200 Today ✓" : "Claim +200 Daily Refresh"}
                </button>
              </div>

              <div className="rounded-3xl border border-teamily bg-teamily-surface p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-teamily-secondary">
                    5-Hour Window Quota
                  </p>
                  <p className="mt-2 text-2xl font-extrabold">500 / 500 Credits</p>
                  <p className="mt-1 text-xs text-teamily-secondary">
                    98% remaining in current 5-hour rolling window
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("invite")}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-teamily bg-teamily-main py-2 text-xs font-bold hover:border-[#087c45]"
                >
                  <UserPlus className="h-3.5 w-3.5 text-[#087c45]" />
                  Redeem or Share Invite
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-teamily bg-teamily-surface p-6">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#087c45]" />
                Credit Consumption Schedule
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="rounded-2xl border border-teamily bg-teamily-main p-4">
                  <p className="font-bold text-sm">Instant Mode</p>
                  <p className="text-[#087c45] font-bold mt-0.5">2 Credits / message</p>
                  <p className="text-teamily-secondary mt-1">
                    Fast, low-latency responses for quick questions and edits.
                  </p>
                </div>
                <div className="rounded-2xl border border-teamily bg-teamily-main p-4">
                  <p className="font-bold text-sm">Auto Mode</p>
                  <p className="text-[#087c45] font-bold mt-0.5">5 Credits / message</p>
                  <p className="text-teamily-secondary mt-1">
                    Balanced routing with Living Wiki context lookup.
                  </p>
                </div>
                <div className="rounded-2xl border border-teamily bg-teamily-main p-4">
                  <p className="font-bold text-sm">Agentic / Swarm Mode</p>
                  <p className="text-[#087c45] font-bold mt-0.5">12 Credits / run</p>
                  <p className="text-teamily-secondary mt-1">
                    Deep multi-step reasoning, multi-agent debate, and artifact generation.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SettingsLayout>
  );
}
