"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PRICING_TIERS } from "@/lib/catalog";
import { Check, Sparkles, Coins, HelpCircle } from "lucide-react";

export default function PricingPage() {
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");

  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ddf3e5] px-3.5 py-1 text-xs font-bold text-[#087c45]">
              <Sparkles className="h-3.5 w-3.5" />
              TRANSPARENT WORKSPACE PRICING
            </span>
            <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
              Scale Your Autonomous Agent Team
            </h1>
            <p className="mt-3 text-sm sm:text-base text-teamily-secondary">
              Start free with your Personal Agent and Living Wiki, or unlock unlimited Multi-Agent Swarm Rooms and scheduled automations.
            </p>

            {/* Billing cycle toggle */}
            <div className="mt-7 inline-flex items-center rounded-2xl border border-teamily bg-teamily-surface p-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBilling("annual")}
                className={`rounded-xl px-4 py-2 transition ${
                  billing === "annual"
                    ? "bg-[#087c45] text-white shadow-xs"
                    : "text-teamily-secondary hover:text-teamily-primary"
                }`}
              >
                Annual Billing (Save 20%)
              </button>
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`rounded-xl px-4 py-2 transition ${
                  billing === "monthly"
                    ? "bg-[#087c45] text-white shadow-xs"
                    : "text-teamily-secondary hover:text-teamily-primary"
                }`}
              >
                Monthly Billing
              </button>
            </div>
          </div>

          {/* 4 Tier Cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PRICING_TIERS.map((tier) => {
              const price =
                billing === "annual" ? tier.annualPricePerMonth : tier.monthlyPrice;
              return (
                <div
                  key={tier.id}
                  className={`flex flex-col justify-between rounded-3xl border p-6 shadow-sm transition ${
                    tier.highlighted
                      ? "border-[#087c45] bg-teamily-surface ring-2 ring-[#087c45]/25"
                      : "border-teamily bg-teamily-surface"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-extrabold">{tier.name}</h2>
                      {tier.badge && (
                        <span className="rounded-full bg-[#ddf3e5] px-2.5 py-0.5 text-[10px] font-bold text-[#087c45]">
                          {tier.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-teamily-secondary min-h-[36px]">
                      {tier.tagline}
                    </p>

                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold">${price}</span>
                      <span className="text-xs text-teamily-secondary">/ user / month</span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-teamily-main border border-teamily px-3 py-2 text-xs">
                      <Coins className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>
                        <strong>{tier.creditsPerMonth.toLocaleString()}</strong> monthly +{" "}
                        <strong>{tier.dailyRefreshCredits}</strong>/day refresh
                      </span>
                    </div>

                    <ul className="mt-6 space-y-2.5 text-xs">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-[#087c45] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Link
                      href="/register"
                      className={`block w-full rounded-xl py-2.5 text-center text-xs font-bold transition ${
                        tier.highlighted
                          ? "bg-[#087c45] text-white hover:bg-[#066a3b]"
                          : "border border-teamily bg-teamily-main hover:bg-teamily-subtle"
                      }`}
                    >
                      {tier.monthlyPrice === 0 ? "Start Free with Invite" : `Upgrade to ${tier.name}`}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Credit Packs & FAQ */}
          <div className="mt-16 rounded-3xl border border-teamily bg-teamily-surface p-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#087c45]" />
              How Teamily Credits & Daily Refresh Work
            </h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-teamily-secondary">
              <div>
                <p className="font-semibold text-teamily-primary mb-1">
                  1. Daily Refresh Credits (200–1,500/day)
                </p>
                <p>
                  Every workspace automatically receives daily refresh credits used first before touching your monthly base balance.
                </p>
              </div>
              <div>
                <p className="font-semibold text-teamily-primary mb-1">
                  2. Auto, Instant & Agentic Modes
                </p>
                <p>
                  Instant mode uses 2 credits per turn, Auto mode uses 5 credits, and deep multi-step Agentic synthesis uses 12 credits.
                </p>
              </div>
              <div>
                <p className="font-semibold text-teamily-primary mb-1">
                  3. Referral & Creator Rewards
                </p>
                <p>
                  Earn +200 bonus credits for every builder who redeems your single-use invitation code and joins Teamily AI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
