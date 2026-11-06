import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Laptop, Smartphone, Terminal, CheckCircle2, Download } from "lucide-react";

export default function DownloadPage() {
  const platforms = [
    {
      title: "Teamily for macOS",
      subtitle: "Apple Silicon (M1–M4) & Intel Universal (.dmg)",
      version: "v2.4.0 • macOS 13.0+",
      icon: Laptop,
      badge: "Recommended",
      features: [
        "Global Cmd+Shift+Space quick-prompt bar anywhere on macOS",
        "Local file & git repository bridge via Teamily Runtime",
        "Native menu-bar notification for Morning Briefings",
      ],
      downloadHref: "#macos-installer",
    },
    {
      title: "Teamily for Windows",
      subtitle: "Windows 11 / 10 (64-bit x64 & ARM64 .exe)",
      version: "v2.4.0 • Windows 10+",
      icon: Terminal,
      badge: "Desktop Runtime",
      features: [
        "Global Ctrl+Shift+Space launcher & clipboard capture",
        "WSL2 & local workspace folder indexing into Living Wiki",
        "Background system tray automation runner",
      ],
      downloadHref: "#windows-installer",
    },
    {
      title: "Teamily Mobile Companion",
      subtitle: "iOS (App Store / TestFlight) & Android (.apk)",
      version: "v2.3.8 • iOS 17+ / Android 13+",
      icon: Smartphone,
      badge: "Voice & Briefings",
      features: [
        "Listen to your Morning Executive Briefing on the go",
        "Voice-to-Living-Wiki capture after in-person meetings",
        "Instant push alerts when Multi-Agent rooms finish tasks",
      ],
      downloadHref: "#mobile-companion",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="rounded-full bg-[#ddf3e5] px-3.5 py-1 text-xs font-bold text-[#087c45]">
              DESKTOP & MOBILE RUNTIMES
            </span>
            <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
              Bring Your AI Agent Team to Every Device
            </h1>
            <p className="mt-3 text-sm sm:text-base text-teamily-secondary">
              Connect local files, terminal runtimes, and voice notes directly to your cloud Living Wiki.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {platforms.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="flex flex-col justify-between rounded-3xl border border-teamily bg-teamily-surface p-7 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ddf3e5] text-[#087c45]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-teamily-subtle px-3 py-1 text-[11px] font-bold text-[#087c45]">
                        {p.badge}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold">{p.title}</h2>
                    <p className="text-xs text-teamily-secondary mt-1">{p.subtitle}</p>
                    <p className="mt-2 font-mono text-[11px] text-[#087c45]">{p.version}</p>

                    <ul className="mt-5 space-y-2.5 text-xs text-teamily-secondary">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#087c45] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-7 pt-4 border-t border-teamily flex flex-col gap-2">
                    <Link
                      href="/chat"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087c45] py-2.5 text-xs font-bold text-white hover:bg-[#066a3b] transition"
                    >
                      <Download className="h-4 w-4" />
                      Launch Web / Desktop Bridge
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
