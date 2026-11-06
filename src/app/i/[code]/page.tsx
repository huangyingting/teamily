import { redirect } from "next/navigation";

export default async function InviteReferralRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = encodeURIComponent((code || "").trim().toUpperCase());
  redirect(`/register?code=${normalized}`);
}
