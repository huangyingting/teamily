import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="rounded-2xl bg-[#ddf3e5] px-4 py-1.5 text-xs font-bold text-[#087c45] mb-4">
          404 • ROUTE NOT FOUND
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          This page could not be found.
        </h1>
        <p className="mt-3 max-w-md text-sm text-teamily-secondary">
          The workspace route, document, or agent room you requested does not exist or has been moved.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-[#087c45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#066a3b] transition"
          >
            Back to Home
          </Link>
          <Link
            href="/chat"
            className="rounded-xl border border-teamily bg-teamily-surface px-5 py-2.5 text-sm font-semibold hover:bg-teamily-subtle transition"
          >
            Open Chat Workspace
          </Link>
        </div>
      </main>
    </div>
  );
}
