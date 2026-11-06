"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { Save, ArrowLeft } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setName(d.profile.name || "");
          setHandle(d.profile.handle || "");
          setBio(d.profile.bio || "");
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, handle, bio }),
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        router.push(`/profile/${data.profile.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceShell>
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teamily-secondary hover:text-teamily-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </button>

          <div className="rounded-3xl border border-teamily bg-teamily-surface p-8">
            <h1 className="text-2xl font-extrabold">Edit Workspace Profile</h1>
            <p className="text-xs text-teamily-secondary mt-1">
              Update your display name, handle, and bio shared with your AI agent team
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-teamily bg-teamily-main px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                  Handle
                </label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full rounded-xl border border-teamily bg-teamily-main px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                  Bio & Personal Agent Context
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-teamily bg-teamily-main p-3.5 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#087c45] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#066a3b]"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Profile Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
