"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SHOWCASE_COMMUNITY_POSTS } from "@/lib/catalog";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  MessageSquare,
  Share2,
  Sparkles,
  Copy,
  Check,
  Send,
} from "lucide-react";

export default function PublicExploreDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const post =
    SHOWCASE_COMMUNITY_POSTS.find((p) => p.id === params?.id) ||
    SHOWCASE_COMMUNITY_POSTS[0];

  const [likes, setLikes] = useState(post.likesCount);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([
    {
      id: "c1",
      author: "@builder_kai",
      text: "Remixed this workflow with Market Research + Slides Assistant — saved 3 hours!",
      time: "2h ago",
    },
  ]);

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: "@guest_explorer",
        text: commentInput.trim(),
        time: "Just now",
      },
    ]);
    setCommentInput("");
  }

  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teamily-secondary hover:text-teamily-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Explore Showcase
            </Link>
            <button
              type="button"
              data-testid="explore-remix-button"
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#066a3b]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Create My Own (Remix)
            </button>
          </div>

          <article className="rounded-3xl border border-teamily bg-teamily-surface p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between text-xs text-teamily-secondary mb-3">
              <span className="rounded-md bg-[#ddf3e5] px-2.5 py-1 font-bold text-[#087c45]">
                {post.category}
              </span>
              <span>
                Created by <strong>{post.authorName}</strong> ({post.authorHandle})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold">{post.title}</h1>
            <p className="mt-3 text-sm text-teamily-secondary leading-relaxed">
              {post.summary}
            </p>

            <div className="mt-6 rounded-2xl border border-[#087c45]/30 bg-[#ddf3e5]/40 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#087c45]">
                  PROMPT
                </span>
                <button
                  type="button"
                  data-testid="explore-copy-prompt"
                  onClick={() => {
                    navigator.clipboard?.writeText(post.promptSnippet);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#087c45]"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy Prompt"}
                </button>
              </div>
              <p className="font-mono text-xs">{post.promptSnippet}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-teamily pt-4 text-xs">
              <button
                type="button"
                aria-label="Like post"
                data-testid="explore-like-button"
                onClick={() => {
                  setLiked(!liked);
                  setLikes((n) => (liked ? n - 1 : n + 1));
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 font-bold ${
                  liked
                    ? "border-[#087c45] bg-[#ddf3e5] text-[#087c45]"
                    : "border-teamily bg-teamily-main"
                }`}
              >
                <Heart className="h-3.5 w-3.5" />
                {likes}
              </button>
              <button
                type="button"
                aria-label="Save post"
                data-testid="explore-save-button"
                onClick={() => setSaved(!saved)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 font-bold ${
                  saved
                    ? "border-[#087c45] bg-[#ddf3e5] text-[#087c45]"
                    : "border-teamily bg-teamily-main"
                }`}
              >
                <Bookmark className="h-3.5 w-3.5" />
                {saved ? "Saved ✓" : "Save"}
              </button>
              <button
                type="button"
                aria-label="Share post"
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-teamily bg-teamily-main px-3.5 py-2 font-bold"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
            </div>

            <div className="mt-8 border-t border-teamily pt-6">
              <h2 className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#087c45]" />
                Comments ({comments.length})
              </h2>
              <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
                <input
                  type="text"
                  data-testid="explore-comment-input"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-xl border border-teamily bg-teamily-main px-3.5 py-2 text-xs"
                />
                <button
                  type="submit"
                  data-testid="explore-comment-submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-xs font-bold text-white"
                >
                  <Send className="h-3.5 w-3.5" />
                  Post
                </button>
              </form>
              <div className="mt-4 space-y-2.5">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-teamily bg-teamily-main p-3 text-xs"
                  >
                    <div className="flex justify-between font-bold text-[#087c45]">
                      <span>{c.author}</span>
                      <span className="text-[11px] text-teamily-secondary">{c.time}</span>
                    </div>
                    <p className="mt-1">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
