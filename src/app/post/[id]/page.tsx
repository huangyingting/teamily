"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { ArrowLeft, Heart, MessageSquare, Sparkles, Bookmark, Copy, Check, Code } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<"preview" | "source">("preview");
  const [saved, setSaved] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; createdAt: string }>>([
    {
      id: "c-1",
      author: "@sarah_growth",
      text: "Remixed this with our Q3 OKR numbers and the agent team produced a ready-to-share deck in 40 seconds!",
      createdAt: "2h ago",
    },
  ]);
  const [commentText, setCommentText] = useState("");

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

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !post) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: "You",
        text: commentText.trim(),
        createdAt: "Just now",
      },
    ]);
    setPost({ ...post, commentsCount: (post.commentsCount || 0) + 1 });
    setCommentText("");
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
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-[#087c45] flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> PROMPT (REMIXABLE WORKFLOW)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        data-testid="copy-post-prompt-button"
                        onClick={() => {
                          setCopiedPrompt(true);
                          setTimeout(() => setCopiedPrompt(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#087c45]/30 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#087c45]"
                      >
                        {copiedPrompt ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedPrompt ? "Copied" : "Copy Prompt"}
                      </button>
                      <button
                        type="button"
                        data-testid="remix-post-button"
                        onClick={() => router.push("/chat")}
                        className="rounded-lg bg-[#087c45] px-2.5 py-1 text-[11px] font-bold text-white"
                      >
                        Create My Own (Remix) →
                      </button>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-teamily-primary">
                    “{post.promptSnippet}”
                  </p>
                </div>
              )}

              {/* Preview vs Source Toggle */}
              <div className="mt-6 flex items-center justify-between border-b border-teamily pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teamily-secondary">
                  Artifact Deliverable
                </span>
                <div className="flex rounded-xl bg-teamily-subtle p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    data-testid="post-view-preview"
                    onClick={() => setViewMode("preview")}
                    className={`rounded-lg px-3 py-1 ${
                      viewMode === "preview" ? "bg-teamily-main shadow-xs" : "text-teamily-secondary"
                    }`}
                  >
                    Live Preview
                  </button>
                  <button
                    type="button"
                    data-testid="post-view-source"
                    onClick={() => setViewMode("source")}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 ${
                      viewMode === "source" ? "bg-teamily-main shadow-xs" : "text-teamily-secondary"
                    }`}
                  >
                    <Code className="h-3 w-3" />
                    Source
                  </button>
                </div>
              </div>

              {viewMode === "preview" ? (
                <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-teamily-primary">
                  {post.content}
                </div>
              ) : (
                <pre className="mt-4 rounded-2xl border border-teamily bg-teamily-main p-4 font-mono text-xs overflow-x-auto">
                  {JSON.stringify(
                    {
                      postId: post.id,
                      category: post.category,
                      prompt: post.promptSnippet,
                      markdownBody: post.content,
                    },
                    null,
                    2
                  )}
                </pre>
              )}

              <div className="mt-8 pt-4 border-t border-teamily flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="post-like-button"
                    onClick={handleLike}
                    className="inline-flex items-center gap-2 rounded-xl border border-teamily bg-teamily-main px-4 py-2 text-xs font-bold hover:border-[#ff5260]"
                  >
                    <Heart className="h-4 w-4 text-[#ff5260]" />
                    Like ({post.likesCount})
                  </button>

                  <button
                    type="button"
                    data-testid="post-save-button"
                    onClick={() => setSaved(!saved)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold ${
                      saved
                        ? "border-[#087c45] bg-[#ddf3e5] text-[#087c45]"
                        : "border-teamily bg-teamily-main text-teamily-secondary"
                    }`}
                  >
                    <Bookmark className="h-4 w-4" />
                    {saved ? "Saved ✓" : "Save"}
                  </button>
                </div>

                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white"
                >
                  <MessageSquare className="h-4 w-4" />
                  Discuss with Personal Agent
                </Link>
              </div>

              {/* Community Comments Section */}
              <div className="mt-8 pt-6 border-t border-teamily space-y-4">
                <h2 className="text-sm font-bold">
                  Community Discussion ({comments.length})
                </h2>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    data-testid="post-comment-input"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment or share how you remixed this artifact..."
                    className="flex-1 rounded-xl border border-teamily bg-teamily-main px-3.5 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    data-testid="post-comment-submit"
                    className="rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#066a3b]"
                  >
                    Post Comment
                  </button>
                </form>

                <div className="space-y-2.5">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-teamily bg-teamily-main p-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#087c45]">{c.author}</span>
                        <span className="text-[10px] text-teamily-secondary">{c.createdAt}</span>
                      </div>
                      <p className="text-teamily-primary">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
