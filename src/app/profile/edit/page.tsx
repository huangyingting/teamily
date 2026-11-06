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
  const [location, setLocation] = useState("San Francisco, CA");
  const [website, setWebsite] = useState("https://teamily.ai");
  const [gender, setGender] = useState("Prefer not to say");
  const [lifeGoals, setLifeGoals] = useState<Record<string, string>>({
    "Career & Mission": "Build an autonomous AI-native product organization",
    "Financial Freedom": "Compound long-term equity and sustainable unit economics",
    "Health & Vitality": "Maintain 8h sleep and daily zone-2 cardiovascular training",
    "Learning & Mastery": "Master multi-agent orchestration and systems architecture",
    "Relationships & Community": "Mentor builders and share open reusable workflows",
    "Creative Expression": "Publish weekly technical essays and interactive artifacts",
    "Lifestyle & Adventure": "Design calm, high-leverage deep work routines",
  });
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
        body: JSON.stringify({
          name,
          handle,
          bio: `${bio}\n\n[Location: ${location} | Website: ${website} | Gender: ${gender}]`,
        }),
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
                  rows={3}
                  data-testid="profile-bio-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-teamily bg-teamily-main p-3.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    data-testid="profile-location-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    data-testid="profile-website-input"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-teamily-secondary mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-2 text-xs"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
              </div>

              {/* 7 Private Life Goals Section */}
              <div className="pt-4 border-t border-teamily space-y-3">
                <div>
                  <h2 className="text-sm font-bold">7 Private Life Goals (Personal Agent Memory)</h2>
                  <p className="text-[11px] text-teamily-secondary">
                    Used privately by your Personal Agent and Life Automations to align daily briefs with your long-term goals.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {Object.entries(lifeGoals).map(([goalCategory, goalVal]) => (
                    <div key={goalCategory}>
                      <label className="block text-[11px] font-bold text-[#087c45] mb-0.5">
                        {goalCategory}
                      </label>
                      <input
                        type="text"
                        value={goalVal}
                        onChange={(e) =>
                          setLifeGoals((prev) => ({ ...prev, [goalCategory]: e.target.value }))
                        }
                        className="w-full rounded-xl border border-teamily bg-teamily-main px-3 py-1.5 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                data-testid="profile-save-button"
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
