"use client";

import React, { useEffect, useState } from "react";
import { SettingsLayout } from "@/components/SettingsLayout";
import {
  ShieldCheck,
  KeyRound,
  Users,
  FileSearch,
  Plus,
  Ban,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";

interface InviteItem {
  id: string;
  code: string;
  assignedRole: string;
  maxUses: number;
  usedCount: number;
  boundEmail: string | null;
  note: string | null;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  redemptions: {
    id: string;
    redeemedAt: string;
    redeemedByUser: { name: string; email: string; handle: string; role: string };
  }[];
}

interface ManagedUser {
  id: string;
  email: string;
  name: string;
  handle: string;
  role: string;
  plan: string;
  isActive: boolean;
  revokedAt: string | null;
  sessionVersion: number;
  sessions: { id: string; sessionToken: string; createdAt: string }[];
}

interface AuditLogEntry {
  id: string;
  actorEmail: string | null;
  actorRole: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export default function SecurityGovernancePage() {
  const [tab, setTab] = useState<"invites" | "users" | "audit">("invites");
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  // Invite creation state
  const [role, setRole] = useState("MEMBER");
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInHours, setExpiresInHours] = useState(168);
  const [boundEmail, setBoundEmail] = useState("");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Audit filter state
  const [auditActionFilter, setAuditActionFilter] = useState("ALL");

  useEffect(() => {
    loadSecurityData();
  }, [auditActionFilter]);

  async function loadSecurityData() {
    const [invRes, usrRes, logRes] = await Promise.all([
      fetch("/api/invites"),
      fetch("/api/admin/users"),
      fetch(`/api/admin/audit-logs?action=${auditActionFilter}`),
    ]);

    if (invRes.ok) {
      const d = await invRes.json();
      setInvites(d.invites || []);
    }
    if (usrRes.ok) {
      const d = await usrRes.json();
      setUsers(d.users || []);
    }
    if (logRes.ok) {
      const d = await logRes.json();
      setLogs(d.logs || []);
    }
  }

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedRole: role,
          maxUses,
          expiresInHours,
          boundEmail: boundEmail.trim() || null,
          note: note.trim() || null,
        }),
      });
      if (res.ok) {
        setBoundEmail("");
        setNote("");
        await loadSecurityData();
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleRevokeInvite(id: string) {
    await fetch(`/api/invites/${id}/revoke`, { method: "POST" });
    await loadSecurityData();
  }

  async function handleUpdateUserRole(userId: string, newRole: string) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    await loadSecurityData();
  }

  async function handleToggleUserActive(user: ManagedUser) {
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    await loadSecurityData();
  }

  async function handleRevokeAllUserSessions(userId: string) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revokeAllSessions: true }),
    });
    await loadSecurityData();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teamily pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#087c45]">
              <ShieldCheck className="h-4 w-4" />
              <span>SECURITY, INVITES, RBAC & AUDIT GOVERNANCE</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold">
              Workspace Access & Audit Console
            </h1>
          </div>

          <div className="flex rounded-2xl border border-teamily bg-teamily-surface p-1 text-xs font-semibold">
            {[
              { id: "invites", label: "Invitation Codes", icon: KeyRound },
              { id: "users", label: "Users & RBAC", icon: Users },
              { id: "audit", label: "Audit Logs", icon: FileSearch },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id as typeof tab)}
                  data-testid={`security-tab-${t.id}`}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition ${
                    tab === t.id
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
        </div>

        {/* TAB 1: INVITATION CODES */}
        {tab === "invites" && (
          <div className="space-y-6">
            <form
              onSubmit={handleCreateInvite}
              className="rounded-3xl border border-teamily bg-teamily-surface p-6 space-y-4"
            >
              <h2 className="text-base font-bold">
                Generate Single-Use / Expiring Invitation Code
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Assigned RBAC Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    data-testid="invite-role-select"
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2 text-xs font-semibold"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="VIEWER">VIEWER (Read-Only)</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Expires In (Hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={expiresInHours}
                    onChange={(e) => setExpiresInHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Optional Bound Email
                  </label>
                  <input
                    type="email"
                    value={boundEmail}
                    onChange={(e) => setBoundEmail(e.target.value)}
                    placeholder="Restrict code to specific email..."
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Audit Note
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Engineering team onboarding"
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                data-testid="create-invite-submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#066a3b]"
              >
                <Plus className="h-4 w-4" />
                {creating ? "Generating..." : "Create Invitation Code"}
              </button>
            </form>

            {/* Invites List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-teamily-secondary">
                Issued Invitation Codes ({invites.length})
              </h3>
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  data-testid={`invite-row-${inv.code}`}
                  className="rounded-2xl border border-teamily bg-teamily-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <code className="font-mono text-base font-extrabold tracking-widest text-teamily-primary">
                        {inv.code}
                      </code>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          inv.status === "ACTIVE"
                            ? "bg-[#ddf3e5] text-[#087c45]"
                            : inv.status === "USED"
                            ? "bg-blue-500/15 text-blue-600"
                            : "bg-[#ff5260]/15 text-[#ff5260]"
                        }`}
                      >
                        {inv.status}
                      </span>
                      <span className="rounded-md bg-teamily-main border border-teamily px-2 py-0.5 text-[10px] font-semibold">
                        Role: {inv.assignedRole}
                      </span>
                      <span className="text-teamily-secondary">
                        Uses: {inv.usedCount}/{inv.maxUses}
                      </span>
                    </div>
                    {inv.note && <p className="mt-1 text-teamily-secondary">Note: {inv.note}</p>}
                    {inv.redemptions.length > 0 && (
                      <p className="mt-1 text-[11px] text-[#087c45] font-medium">
                        Redeemed by:{" "}
                        {inv.redemptions
                          .map((r) => `${r.redeemedByUser.name} (${r.redeemedByUser.email})`)
                          .join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyCode(inv.code)}
                      className="inline-flex items-center gap-1 rounded-xl border border-teamily bg-teamily-main px-3 py-1.5 font-semibold hover:bg-teamily-subtle"
                    >
                      {copiedCode === inv.code ? (
                        <Check className="h-3.5 w-3.5 text-[#087c45]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedCode === inv.code ? "Copied" : "Copy"}
                    </button>

                    {inv.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => handleRevokeInvite(inv.id)}
                        data-testid={`revoke-invite-${inv.code}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#ff5260]/40 bg-[#ff5260]/10 px-3 py-1.5 font-semibold text-[#ff5260] hover:bg-[#ff5260]/20"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: USERS & RBAC + SESSION REVOCATION */}
        {tab === "users" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold">
              Registered Workspace Members & Session Governance ({users.length})
            </h2>
            {users.map((u) => (
              <div
                key={u.id}
                className="rounded-2xl border border-teamily bg-teamily-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{u.name}</span>
                    <span className="text-teamily-secondary">(@{u.handle})</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        u.isActive
                          ? "bg-[#ddf3e5] text-[#087c45]"
                          : "bg-[#ff5260]/15 text-[#ff5260]"
                      }`}
                    >
                      {u.isActive ? "ACTIVE" : "REVOKED"}
                    </span>
                  </div>
                  <p className="text-teamily-secondary mt-0.5">{u.email}</p>
                  <p className="text-[11px] text-teamily-secondary mt-1">
                    Active Sessions: {u.sessions.length} • Session Version: v{u.sessionVersion}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                    data-testid={`user-role-select-${u.handle}`}
                    className="rounded-xl border border-teamily bg-teamily-main px-3 py-1.5 text-xs font-bold"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="MEMBER">MEMBER</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRevokeAllUserSessions(u.id)}
                    className="rounded-xl border border-teamily bg-teamily-main px-3 py-1.5 font-semibold hover:bg-teamily-subtle"
                  >
                    Revoke Sessions
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleUserActive(u)}
                    className={`rounded-xl px-3 py-1.5 font-bold ${
                      u.isActive
                        ? "border border-[#ff5260]/40 bg-[#ff5260]/10 text-[#ff5260]"
                        : "bg-[#087c45] text-white"
                    }`}
                  >
                    {u.isActive ? "Revoke Account" : "Restore Account"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: IMMUTABLE AUDIT LOGS */}
        {tab === "audit" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">
                Immutable Security & Operational Audit Trail ({logs.length})
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="rounded-xl border border-teamily bg-teamily-surface px-3 py-1.5 text-xs font-semibold"
                >
                  <option value="ALL">All Actions</option>
                  <option value="INVITE_CREATED">INVITE_CREATED</option>
                  <option value="INVITE_REDEEM_SUCCESS">INVITE_REDEEM_SUCCESS</option>
                  <option value="INVITE_REDEEM_FAILURE">INVITE_REDEEM_FAILURE</option>
                  <option value="INVITE_REVOKED">INVITE_REVOKED</option>
                  <option value="AUTH_LOGIN_SUCCESS">AUTH_LOGIN_SUCCESS</option>
                  <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
                  <option value="SESSION_REVOKED">SESSION_REVOKED</option>
                </select>
                <button
                  type="button"
                  onClick={() => loadSecurityData()}
                  className="rounded-xl border border-teamily bg-teamily-surface p-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-teamily bg-teamily-surface overflow-hidden">
              <div className="divide-y divide-teamily text-xs">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    data-testid={`audit-log-${log.action}`}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            log.status === "SUCCESS"
                              ? "bg-[#ddf3e5] text-[#087c45]"
                              : "bg-[#ff5260]/15 text-[#ff5260]"
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="font-semibold">
                          Actor: {log.actorEmail || "anonymous"} ({log.actorRole || "N/A"})
                        </span>
                        <span className="text-teamily-secondary">
                          Target: {log.targetType} {log.targetId ? `#${log.targetId.slice(0, 8)}` : ""}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-teamily-secondary">
                        {JSON.stringify(log.metadata)}
                      </p>
                    </div>
                    <span className="text-[11px] text-teamily-secondary shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}
