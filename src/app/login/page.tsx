"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { KeyRound, Lock, Mail, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "invite">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [verifyingInvite, setVerifyingInvite] = useState(false);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/chat");
        router.refresh();
      }
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickInviteRedeem(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    setVerifyingInvite(true);
    try {
      const res = await fetch("/api/invites/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setInviteError(data.message || "Invalid invite code");
      } else {
        router.push(`/register?code=${encodeURIComponent(data.code)}`);
      }
    } catch {
      setInviteError("Invalid invite code");
    } finally {
      setVerifyingInvite(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-teamily bg-teamily-surface p-8 shadow-xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#087c45] text-white text-2xl shadow-md mb-3">
              🌿
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Welcome to Teamily AI
            </h1>
            <p className="mt-1 text-xs text-teamily-secondary">
              Sign in to your autonomous AI agent workspace or redeem an invitation code
            </p>
          </div>

          <div className="grid grid-cols-2 rounded-xl bg-teamily-subtle p-1 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setError(null);
              }}
              className={`rounded-lg py-2 transition ${
                activeTab === "login"
                  ? "bg-teamily-main text-teamily-primary shadow-xs"
                  : "text-teamily-secondary hover:text-teamily-primary"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("invite");
                setInviteError(null);
              }}
              className={`rounded-lg py-2 transition ${
                activeTab === "invite"
                  ? "bg-teamily-main text-teamily-primary shadow-xs"
                  : "text-teamily-secondary hover:text-teamily-primary"
              }`}
            >
              Redeem Invite Code
            </button>
          </div>

          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-xl border border-[#ff5260]/40 bg-[#ff5260]/10 px-3.5 py-2.5 text-xs font-medium text-[#ff5260]"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-teamily-secondary" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-teamily bg-teamily-main pl-10 pr-4 py-2.5 text-sm focus:border-[#087c45] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-teamily-secondary" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-teamily bg-teamily-main pl-10 pr-4 py-2.5 text-sm focus:border-[#087c45] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087c45] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#066a3b] disabled:opacity-50 transition"
              >
                {loading ? "Signing in..." : "Sign In to Workspace"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-xs text-teamily-secondary pt-2">
                New to Teamily AI?{" "}
                <Link href="/register" className="font-semibold text-[#087c45] hover:underline">
                  Register with an Invitation Code →
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleQuickInviteRedeem} className="space-y-4">
              {inviteError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-xl border border-[#ff5260]/40 bg-[#ff5260]/10 px-3.5 py-2.5 text-xs font-medium text-[#ff5260]"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{inviteError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1.5">
                  6-Character Invitation Code
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-teamily-secondary" />
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code"
                    className="w-full rounded-xl border border-teamily bg-teamily-main pl-10 pr-4 py-2.5 font-mono text-sm tracking-widest uppercase focus:border-[#087c45] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyingInvite}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087c45] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#066a3b] disabled:opacity-50 transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                {verifyingInvite ? "Verifying Code..." : "Redeem & Continue"}
              </button>

              <p className="text-center text-xs text-teamily-secondary pt-2">
                Or go directly to{" "}
                <Link href="/register" className="font-semibold text-[#087c45] hover:underline">
                  Full Invite-Only Registration →
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
