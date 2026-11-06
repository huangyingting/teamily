import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Code2 } from "lucide-react";

const OPEN_SOURCE_PACKAGES = [
  { name: "Next.js", license: "MIT", url: "https://nextjs.org" },
  { name: "React & React DOM", license: "MIT", url: "https://react.dev" },
  { name: "Prisma ORM", license: "Apache-2.0", url: "https://prisma.io" },
  { name: "NextAuth.js / Auth.js", license: "ISC", url: "https://authjs.dev" },
  { name: "Tailwind CSS", license: "MIT", url: "https://tailwindcss.com" },
  { name: "Lucide Icons", license: "ISC", url: "https://lucide.dev" },
  { name: "TipTap / ProseMirror", license: "MIT", url: "https://tiptap.dev" },
];

export default function OpenSourceLicensesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-teamily-main text-teamily-primary">
      <PublicNavbar />
      <main className="flex-1 py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ddf3e5] px-3.5 py-1 text-xs font-bold text-[#087c45]">
            <Code2 className="h-3.5 w-3.5" />
            ATTRIBUTIONS
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Open Source Licenses
          </h1>
          <p className="mt-2 text-xs text-teamily-secondary">
            Teamily AI is built with gratitude on top of open-source software.
          </p>

          <div className="mt-8 rounded-3xl border border-teamily bg-teamily-surface overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-teamily bg-teamily-main text-teamily-secondary">
                <tr>
                  <th className="py-3.5 px-5 font-bold">Package</th>
                  <th className="py-3.5 px-5 font-bold">License</th>
                  <th className="py-3.5 px-5 font-bold">Project URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teamily">
                {OPEN_SOURCE_PACKAGES.map((pkg) => (
                  <tr key={pkg.name}>
                    <td className="py-3.5 px-5 font-bold">{pkg.name}</td>
                    <td className="py-3.5 px-5">
                      <span className="rounded-md bg-[#ddf3e5] px-2 py-0.5 font-mono text-[11px] font-bold text-[#087c45]">
                        {pkg.license}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-teamily-secondary font-mono">
                      {pkg.url}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-4 text-xs font-semibold text-[#087c45]">
            <Link href="/about/terms-of-service" className="hover:underline">
              ← Terms of Service
            </Link>
            <Link href="/about/privacy-policy" className="hover:underline">
              Privacy Policy →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
