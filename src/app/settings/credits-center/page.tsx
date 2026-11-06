"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SettingsLayout } from "@/components/SettingsLayout";
import { Coins, Sparkles, RefreshCw, ArrowUpRight, UserPlus } from "lucide-react";

export default function CreditsCenterPage() {
  const [credits, setCredits] = useState(500);
  const [dailyCredits, setDailyCredits] = useState(200);
  const [plan, setPlan] = useState("Free");
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
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

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Credits Center</h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Track your workspace compute balance, daily refresh credits, and referral bonuses
            </p>
          </div>
          <Link
            href="/settings/subscription"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white"
          >
            Upgrade Plan <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-teamily bg-teamily-surface p-6">
            <p className="text-xs font-bold uppercase text-teamily-secondary">
              Available Credit Balance
            </p>
            <p className="mt-2 text-4xl font-extrabold text-[#087c45] flex items-center gap-2">
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
                Invite & Referral Bonus
              </p>
              <p className="mt-2 text-2xl font-extrabold">+200 Credits</p>
              <p className="mt-1 text-xs text-teamily-secondary">
                Earned for every builder who redeems your invite code
              </p>
            </div>
            <Link
              href="/settings/security"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-teamily bg-teamily-main py-2 text-xs font-bold hover:border-[#087c45]"
            >
              <UserPlus className="h-3.5 w-3.5 text-[#087c45]" />
              Generate Invite Code
            </Link>
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
      </div>
    </SettingsLayout>
  );
}
