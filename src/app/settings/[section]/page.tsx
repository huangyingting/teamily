"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SettingsLayout } from "@/components/SettingsLayout";
import {
  PRICING_TIERS,
  PLATFORM_SKILLS,
  PLATFORM_CONNECTORS,
} from "@/lib/catalog";
import { Check, Sparkles, Plug, Puzzle, Terminal, Radio, BarChart3, Share2 } from "lucide-react";

interface IntegrationItem {
  id: string;
  category: string;
  key: string;
  name: string;
  isEnabled: boolean;
}

export default function DynamicSettingsSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params?.section || "subscription";

  const [userPlan, setUserPlan] = useState("Free");
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [usage, setUsage] = useState({
    messageCount: 0,
    automationCount: 0,
    artifactCount: 0,
    wikiCount: 0,
  });

  useEffect(() => {
    loadSettings();
  }, [section]);

  async function loadSettings() {
    const res = await fetch("/api/settings");
    if (!res.ok) return;
    const data = await res.json();
    if (data.user) setUserPlan(data.user.plan);
    if (data.integrations) setIntegrations(data.integrations);
    if (data.usage) setUsage(data.usage);
  }

  async function handleSelectPlan(planName: string) {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planName }),
    });
    if (res.ok) {
      setUserPlan(planName);
    }
  }

  async function handleToggleIntegration(
    category: "SKILL" | "CONNECTOR",
    key: string,
    name: string,
    currentlyEnabled: boolean
  ) {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        integrationCategory: category,
        integrationKey: key,
        integrationName: name,
        isEnabled: !currentlyEnabled,
      }),
    });
    await loadSettings();
  }

  function isEnabled(category: string, key: string, defaultVal = false) {
    const found = integrations.find(
      (i) => i.category === category && i.key === key
    );
    return found ? found.isEnabled : defaultVal;
  }

  return (
    <SettingsLayout>
      {/* 1. SUBSCRIPTION */}
      {section === "subscription" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold">Subscription & Plan</h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Current Workspace Tier: <strong className="text-[#087c45]">{userPlan}</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRICING_TIERS.map((tier) => {
              const current = userPlan.toLowerCase() === tier.name.toLowerCase();
              return (
                <div
                  key={tier.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between ${
                    current
                      ? "border-[#087c45] bg-[#ddf3e5]/30"
                      : "border-teamily bg-teamily-surface"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-extrabold">{tier.name}</h2>
                      <span className="text-xl font-black">${tier.monthlyPrice}/mo</span>
                    </div>
                    <p className="mt-1 text-xs text-teamily-secondary">{tier.tagline}</p>
                    <ul className="mt-4 space-y-1.5 text-xs">
                      {tier.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-[#087c45] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    disabled={current}
                    onClick={() => handleSelectPlan(tier.name)}
                    className={`mt-5 w-full rounded-xl py-2 text-xs font-bold ${
                      current
                        ? "bg-teamily-subtle text-teamily-secondary"
                        : "bg-[#087c45] text-white hover:bg-[#066a3b]"
                    }`}
                  >
                    {current ? "Current Active Plan" : `Switch to ${tier.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. USAGE */}
      {section === "usage" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#087c45]" /> Workspace Usage Analytics
            </h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Real-time activity across your conversations, automations, artifacts, and Living Wiki
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Chat Messages", value: usage.messageCount },
              { label: "Scheduled Automations", value: usage.automationCount },
              { label: "Cloud Docs & Artifacts", value: usage.artifactCount },
              { label: "Living Wiki Pages", value: usage.wikiCount },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-teamily bg-teamily-surface p-5"
              >
                <p className="text-xs text-teamily-secondary font-semibold">{stat.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-[#087c45]">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SKILL CONFIGURATION */}
      {section === "skill-configuration" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Puzzle className="h-6 w-6 text-[#087c45]" /> Skill Configuration
            </h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Enable or disable native AI capabilities available to your Personal Agent and Swarm rooms
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORM_SKILLS.map((skill) => {
              const enabled = isEnabled("SKILL", skill.id, skill.enabledByDefault);
              return (
                <div
                  key={skill.id}
                  className="rounded-2xl border border-teamily bg-teamily-surface p-5 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{skill.icon}</span>
                      <h3 className="font-bold text-sm">{skill.name}</h3>
                    </div>
                    <p className="mt-1 text-xs text-teamily-secondary">{skill.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleIntegration("SKILL", skill.id, skill.name, enabled)
                    }
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold ${
                      enabled
                        ? "bg-[#087c45] text-white"
                        : "border border-teamily bg-teamily-main text-teamily-secondary"
                    }`}
                  >
                    {enabled ? "Enabled" : "Enable"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CONNECTORS */}
      {section === "connectors" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Plug className="h-6 w-6 text-[#087c45]" /> App Connectors
            </h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Connect external knowledge bases, calendars, and code repositories to your Living Wiki
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORM_CONNECTORS.map((conn) => {
              const enabled = isEnabled("CONNECTOR", conn.id, false);
              return (
                <div
                  key={conn.id}
                  className="rounded-2xl border border-teamily bg-teamily-surface p-5 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{conn.icon}</span>
                      <h3 className="font-bold text-sm">{conn.name}</h3>
                      <span className="rounded-md bg-teamily-subtle px-2 py-0.5 text-[10px] font-semibold">
                        {conn.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-teamily-secondary">{conn.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleIntegration("CONNECTOR", conn.id, conn.name, enabled)
                    }
                    className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold ${
                      enabled
                        ? "bg-[#ddf3e5] text-[#087c45]"
                        : "bg-[#087c45] text-white"
                    }`}
                  >
                    {enabled ? "Connected ✓" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. CHANNELS, AGENT ACCESS, RUNTIMES, CREATOR CENTER, AFFILIATE */}
      {!["subscription", "usage", "skill-configuration", "connectors"].includes(section) && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-teamily bg-teamily-surface p-8">
            <div className="flex items-center gap-2 text-xs font-bold text-[#087c45] uppercase mb-2">
              {section === "channels" && <Radio className="h-4 w-4" />}
              {section === "runtimes" && <Terminal className="h-4 w-4" />}
              {section === "creator-center" && <Sparkles className="h-4 w-4" />}
              {section === "affiliate" && <Share2 className="h-4 w-4" />}
              <span>WORKSPACE MODULE • {section.replace(/-/g, " ").toUpperCase()}</span>
            </div>
            <h1 className="text-2xl font-extrabold capitalize">
              {section.replace(/-/g, " ")} Configuration
            </h1>
            <p className="mt-2 text-xs text-teamily-secondary leading-relaxed max-w-2xl">
              {section === "channels" &&
                "Bridge your Personal Agent and Multi-Agent rooms to external messaging channels including Slack, Feishu/Lark, Telegram, and Discord."}
              {section === "agent-access" &&
                "Control which specialist agents can read and write to your Living Wiki pages, Cloud Documents, and scheduled automations."}
              {section === "runtimes" &&
                "Manage Cloud Sandbox and Desktop Local Runtime bridges for code execution, git repository indexing, and browser automation."}
              {section === "creator-center" &&
                "Publish custom specialist agents, Agent Teams, and Automation templates to the Teamily Discover directory and earn creator credit rewards."}
              {section === "affiliate" &&
                "Share your Teamily referral link and single-use invitation codes to earn 200 bonus credits and 25% recurring affiliate rewards."}
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl border border-teamily bg-teamily-main p-4">
                <p className="font-bold">Status</p>
                <p className="text-[#087c45] font-semibold mt-1">Active & Synchronized with Workspace</p>
              </div>
              <div className="rounded-2xl border border-teamily bg-teamily-main p-4">
                <p className="font-bold">Access Policy</p>
                <p className="text-teamily-secondary mt-1">
                  Governed by Workspace RBAC & Audit Logging
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}
