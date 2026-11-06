"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "./Providers";
import { Sun, Moon, Menu, X, ArrowRight, Sparkles } from "lucide-react";

export function PublicNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Overview" },
    { href: "/explore", label: "Explore" },
    { href: "/pricing", label: "Pricing" },
    { href: "/download", label: "Download" },
    { href: "/about", label: "About" },
    { href: "/about/help-center", label: "Help Center" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-teamily bg-teamily-main/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#087c45] text-white shadow-sm">
              🌿
            </span>
            <span className="text-teamily-primary">Teamily</span>
            <span className="rounded-full bg-[#ddf3e5] px-2 py-0.5 text-[11px] font-semibold text-[#087c45]">
              AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[#ddf3e5] text-[#087c45]"
                      : "text-teamily-secondary hover:bg-teamily-subtle hover:text-teamily-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-teamily bg-teamily-surface text-teamily-secondary hover:text-teamily-primary"
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {session?.user ? (
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-[#087c45] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#066a3b] transition"
            >
              <Sparkles className="h-4 w-4" />
              Open Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-teamily-primary hover:bg-teamily-subtle transition"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#087c45] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#066a3b] transition"
              >
                Redeem Invite
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-teamily bg-teamily-surface"
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-teamily bg-teamily-surface"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-teamily bg-teamily-main px-4 py-4 md:hidden space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-teamily-primary hover:bg-teamily-subtle"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2 border-t border-teamily">
            {session?.user ? (
              <Link
                href="/chat"
                className="w-full text-center rounded-xl bg-[#087c45] py-2.5 text-sm font-semibold text-white"
              >
                Open Workspace
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full text-center rounded-xl border border-teamily py-2 text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="w-full text-center rounded-xl bg-[#087c45] py-2 text-sm font-semibold text-white"
                >
                  Redeem Invite Code
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
