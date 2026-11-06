import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Teamily AI — Build Your Autonomous AI Agent Team & Living Wiki",
  description:
    "Collaborate with specialist AI agents, multi-agent war rooms, scheduled Work & Life automations, and a compounding Living Wiki.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
