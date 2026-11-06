import NextAuth, { DefaultSession } from "next-auth";
import { UserRole } from "@/lib/invites";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      handle: string;
      role: UserRole;
      plan: string;
      credits: number;
      dailyCredits: number;
      avatarUrl?: string | null;
      bio?: string | null;
      sessionToken?: string;
    } & DefaultSession["user"];
  }
}
