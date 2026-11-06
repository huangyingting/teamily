"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { ArrowLeft, Heart, MessageSquare, Sparkles } from "lucide-react";

interface PostDetail {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  likesCount: number;
  commentsCount: number;
  authorName: string;
  authorHandle: string;
  promptSnippet?: string;
}

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/posts/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.post) setPost(d.post);
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  async function handleLike() {
    if (!post) return;
    setPost({ ...post, likesCount: post.likesCount + 1 });
    await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ like: true }),
    });
  }

  return (
    <WorkspaceShell>
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teamily-secondary hover:text-teamily-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discover Feed
          </Link>

          {loading ? (
            <div className="text-sm text-teamily-secondary">Loading post...</div>
          ) : !post ? (
            <div className="rounded-2xl border border-teamily bg-teamily-surface p-8 text-center">
              <p className="font-bold">Post not found</p>
            </div>
          ) : (
            <article className="rounded-3xl border border-teamily bg-teamily-surface p-8 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="rounded-full bg-[#ddf3e5] px-3 py-1 font-bold text-[#087c45]">
                  {post.category}
                </span>
                <span className="text-teamily-secondary">
                  {post.authorName} ({post.authorHandle})
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                {post.title}
              </h1>

              {post.promptSnippet && (
                <div className="mt-5 rounded-2xl border border-[#087c45]/30 bg-[#ddf3e5]/50 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[#087c45] flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> REUSABLE WORKFLOW PROMPT
                    </span>
                    <button
                      type="button"
                      onClick={() => router.push("/chat")}
                      className="rounded-lg bg-[#087c45] px-2.5 py-1 text-[11px] font-bold text-white"
                    >
                      Try in Chat →
                    </button>
                  </div>
                  <p className="font-mono text-xs text-teamily-primary">
                    “{post.promptSnippet}”
                  </p>
                </div>
              )}

              <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-teamily-primary">
                {post.content}
              </div>

              <div className="mt-8 pt-4 border-t border-teamily flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLike}
                  className="inline-flex items-center gap-2 rounded-xl border border-teamily bg-teamily-main px-4 py-2 text-xs font-bold hover:border-[#ff5260]"
                >
                  <Heart className="h-4 w-4 text-[#ff5260]" />
                  Like ({post.likesCount})
                </button>

                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white"
                >
                  <MessageSquare className="h-4 w-4" />
                  Discuss with Personal Agent
                </Link>
              </div>
            </article>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
