"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { PublicNavbar } from "@/components/PublicNavbar";
import {
  KeyRound,
  Mail,
  Lock,
  User,
  AtSign,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");
  const [verifiedInfo, setVerifiedInfo] = useState<{
    code: string;
    assignedRole: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [canBootstrap, setCanBootstrap] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    fetch("/api/invites/bootstrap")
      .then((r) => r.json())
      .then((d) => {
        if (d.canBootstrap) {
          setCanBootstrap(true);
        }
      })
      .catch(() => {});
  }, []);

  async function handleBootstrapInvite() {
    setBootstrapping(true);
    setError(null);
    try {
      const res = await fetch("/api/invites/bootstrap", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.invite?.code) {
        setInviteCode(data.invite.code);
        setVerifiedInfo({
          code: data.invite.code,
          assignedRole: data.invite.assignedRole,
        });
      } else {
        setError(data.message || "Could not generate bootstrap invite");
      }
    } finally {
      setBootstrapping(false);
    }
  }

  async function handleVerifyCode() {
    setError(null);
    setVerifying(true);
    try {
      const res = await fetch("/api/invites/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode.trim(), email: email.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setVerifiedInfo(null);
        setError(data.message || "Invalid invite code");
      } else {
        setVerifiedInfo({
          code: data.code,
          assignedRole: data.assignedRole,
        });
      }
    } catch {
      setError("Invalid invite code");
    } finally {
      setVerifying(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
          name: name.trim(),
          handle: handle.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      const loginRes = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (loginRes?.ok) {
        router.push("/chat");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      setError("Registration failed. Please check your invitation code.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-lg rounded-3xl border border-teamily bg-teamily-surface p-8 shadow-xl">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#087c45] text-white text-2xl shadow-md mb-3">
          🌿
        </div>
        <span className="rounded-full bg-[#ddf3e5] px-3 py-1 text-[11px] font-bold text-[#087c45] mb-2">
          INVITE-ONLY ACCESS
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Create Your Teamily AI Account
        </h1>
        <p className="mt-1 text-xs text-teamily-secondary">
          Enter a single-use invitation code to provision your Personal Agent, Living Wiki & Swarm Rooms
        </p>
      </div>

      {canBootstrap && !verifiedInfo && (
        <div className="mb-5 rounded-2xl border border-[#087c45]/40 bg-[#ddf3e5]/60 p-4 text-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[#087c45] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                First-Run Workspace Bootstrap Detected (0 Users)
              </p>
              <p className="mt-1 text-teamily-secondary">
                No user accounts exist yet. Generate the initial single-use <strong>ADMIN</strong> invitation code to register the workspace owner.
              </p>
            </div>
            <button
              type="button"
              disabled={bootstrapping}
              onClick={handleBootstrapInvite}
              data-testid="bootstrap-invite-button"
              className="shrink-0 rounded-xl bg-[#087c45] px-3 py-2 font-semibold text-white hover:bg-[#066a3b] transition"
            >
              {bootstrapping ? "Generating..." : "Generate Admin Invite"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          data-testid="register-error"
          className="mb-4 flex items-center gap-2 rounded-xl border border-[#ff5260]/40 bg-[#ff5260]/10 px-3.5 py-2.5 text-xs font-medium text-[#ff5260]"
        >
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {verifiedInfo && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#087c45]/40 bg-[#ddf3e5]/60 px-3.5 py-2.5 text-xs text-[#087c45]">
          <span className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Code {verifiedInfo.code} verified
          </span>
          <span className="rounded-md bg-[#087c45] px-2 py-0.5 text-[10px] font-bold text-white">
            Role: {verifiedInfo.assignedRole}
          </span>
        </div>
      )}

      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-teamily-secondary mb-1.5">
            Invitation Code *
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-teamily-secondary" />
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="6-character invite code"
                data-testid="invite-code-input"
                className="w-full rounded-xl border border-teamily bg-teamily-main pl-10 pr-4 py-2.5 font-mono text-sm tracking-widest uppercase focus:border-[#087c45] focus:outline-none"
              />
            </div>
            <button
              type="button"
              disabled={verifying || !inviteCode.trim()}
              onClick={handleVerifyCode}
              data-testid="verify-invite-button"
              className="rounded-xl border border-teamily bg-teamily-main px-4 py-2.5 text-xs font-semibold hover:bg-teamily-subtle disabled:opacity-50 transition"
            >
              {verifying ? "Checking..." : "Verify Code"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-teamily-secondary mb-1.5">
              Display Name *
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-teamily-secondary" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Chen"
                className="w-full rounded-xl border border-teamily bg-teamily-main pl-10 pr-3 py-2.5 text-sm focus:border-[#087c45] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-teamily-secondary mb-1.5">
              Workspace Handle
            </label>
            <div className="relative">
              <AtSign className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-teamily-secondary" />
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="alexchen"
                className="w-full rounded-xl border border-teamily bg-teamily-main pl-10 pr-3 py-2.5 text-sm focus:border-[#087c45] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-teamily-secondary mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-teamily-secondary" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full rounded-xl border border-teamily bg-teamily-main pl-10 pr-4 py-2.5 text-sm focus:border-[#087c45] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-teamily-secondary mb-1.5">
            Password (minimum 8 characters) *
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-teamily-secondary" />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-teamily bg-teamily-main pl-10 pr-4 py-2.5 text-sm focus:border-[#087c45] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          data-testid="register-submit-button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087c45] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#066a3b] disabled:opacity-50 transition"
        >
          {submitting ? "Provisioning Workspace..." : "Redeem Invite & Launch Workspace"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-center text-xs text-teamily-secondary pt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#087c45] hover:underline">
            Sign in →
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="text-sm text-teamily-secondary">Loading registration...</div>}>
          <RegisterFormContent />
        </Suspense>
      </main>
    </div>
  );
}
