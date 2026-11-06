"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { Edit3, Bot, BookOpen, MessageSquare } from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  handle: string;
  email: string;
  bio: string | null;
  role: string;
  plan: string;
  credits: number;
  agents: { id: string; name: string; title: string; avatarEmoji: string }[];
  communityPosts: { id: string; title: string; category: string; likesCount: number }[];
  wikiPages: { id: string; title: string; icon: string; category: string }[];
}

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const query = params?.id && params.id !== "me" ? `?id=${params.id}` : "";
    fetch(`/api/profile${query}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setProfile(d.profile);
      });
  }, [params?.id]);

  return (
    <WorkspaceShell>
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {profile && (
            <>
              <div className="rounded-3xl border border-teamily bg-teamily-surface p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#087c45] text-white text-2xl font-extrabold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-extrabold">{profile.name}</h1>
                      <span className="rounded-md bg-[#ddf3e5] px-2 py-0.5 text-[10px] font-bold text-[#087c45]">
                        {profile.role}
                      </span>
                      <span className="rounded-md bg-teamily-subtle px-2 py-0.5 text-[10px] font-semibold">
                        {profile.plan} Plan
                      </span>
                    </div>
                    <p className="text-xs text-teamily-secondary mt-0.5">@{profile.handle}</p>
                    <p className="mt-2 text-xs text-teamily-primary max-w-xl">
                      {profile.bio || "Building autonomous multi-agent workflows on Teamily AI."}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile/edit"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teamily bg-teamily-main px-4 py-2 text-xs font-bold hover:bg-teamily-subtle shrink-0"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="rounded-2xl border border-teamily bg-teamily-surface p-5">
                  <h2 className="text-xs font-bold uppercase text-teamily-secondary flex items-center gap-1.5 mb-3">
                    <Bot className="h-4 w-4 text-[#087c45]" /> Custom Agents ({profile.agents.length})
                  </h2>
                  <div className="space-y-2 text-xs">
                    {profile.agents.map((a) => (
                      <div key={a.id} className="rounded-xl bg-teamily-main p-2.5 border border-teamily">
                        <p className="font-bold">
                          {a.avatarEmoji} {a.name}
                        </p>
                        <p className="text-teamily-secondary text-[11px]">{a.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-teamily bg-teamily-surface p-5">
                  <h2 className="text-xs font-bold uppercase text-teamily-secondary flex items-center gap-1.5 mb-3">
                    <BookOpen className="h-4 w-4 text-[#087c45]" /> Living Wiki ({profile.wikiPages.length})
                  </h2>
                  <div className="space-y-2 text-xs">
                    {profile.wikiPages.map((w) => (
                      <Link
                        key={w.id}
                        href="/memory"
                        className="block rounded-xl bg-teamily-main p-2.5 border border-teamily hover:border-[#087c45]"
                      >
                        <p className="font-bold">
                          {w.icon} {w.title}
                        </p>
                        <p className="text-teamily-secondary text-[11px]">{w.category}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-teamily bg-teamily-surface p-5">
                  <h2 className="text-xs font-bold uppercase text-teamily-secondary flex items-center gap-1.5 mb-3">
                    <MessageSquare className="h-4 w-4 text-[#087c45]" /> Community Posts ({profile.communityPosts.length})
                  </h2>
                  <div className="space-y-2 text-xs">
                    {profile.communityPosts.length === 0 ? (
                      <p className="text-teamily-secondary">No public posts yet.</p>
                    ) : (
                      profile.communityPosts.map((p) => (
                        <Link
                          key={p.id}
                          href={`/post/${p.id}`}
                          className="block rounded-xl bg-teamily-main p-2.5 border border-teamily hover:border-[#087c45]"
                        >
                          <p className="font-bold">{p.title}</p>
                          <p className="text-teamily-secondary text-[11px]">
                            {p.category} • ❤️ {p.likesCount}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
