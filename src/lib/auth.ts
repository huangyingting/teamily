import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./prisma";
import { recordAuditLog } from "./audit";
import { UserRole } from "./invites";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Please enter both email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          await recordAuditLog({
            actorEmail: email,
            action: "AUTH_LOGIN_FAILURE",
            targetType: "USER",
            status: "FAILURE",
            metadata: { reason: "USER_NOT_FOUND" },
          });
          throw new Error("Invalid email or password");
        }

        if (!user.isActive || user.revokedAt) {
          await recordAuditLog({
            actorId: user.id,
            actorEmail: user.email,
            actorRole: user.role,
            action: "AUTH_LOGIN_FAILURE",
            targetType: "USER",
            targetId: user.id,
            status: "FAILURE",
            metadata: { reason: "ACCOUNT_REVOKED" },
          });
          throw new Error("This account has been revoked by an administrator");
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          await recordAuditLog({
            actorId: user.id,
            actorEmail: user.email,
            actorRole: user.role,
            action: "AUTH_LOGIN_FAILURE",
            targetType: "USER",
            targetId: user.id,
            status: "FAILURE",
            metadata: { reason: "INVALID_PASSWORD" },
          });
          throw new Error("Invalid email or password");
        }

        // Create a revocable UserSession row
        const sessionToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
        await prisma.userSession.create({
          data: {
            sessionToken,
            userId: user.id,
            expiresAt,
          },
        });

        await recordAuditLog({
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: "AUTH_LOGIN_SUCCESS",
          targetType: "SESSION",
          targetId: sessionToken,
          status: "SUCCESS",
          metadata: { handle: user.handle, role: user.role },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          handle: user.handle,
          role: user.role,
          plan: user.plan,
          credits: user.credits,
          sessionVersion: user.sessionVersion,
          sessionToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as {
          id: string;
          email: string;
          name: string;
          handle: string;
          role: string;
          plan: string;
          credits: number;
          sessionVersion: number;
          sessionToken: string;
        };
        token.sub = u.id;
        token.email = u.email;
        token.name = u.name;
        token.handle = u.handle;
        token.role = u.role;
        token.plan = u.plan;
        token.credits = u.credits;
        token.sessionVersion = u.sessionVersion;
        token.sessionToken = u.sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) {
        // Verify live user state & session revocation in database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            email: true,
            name: true,
            handle: true,
            role: true,
            plan: true,
            credits: true,
            dailyCredits: true,
            isActive: true,
            revokedAt: true,
            sessionVersion: true,
            avatarUrl: true,
            bio: true,
          },
        });

        if (
          !dbUser ||
          !dbUser.isActive ||
          dbUser.revokedAt ||
          dbUser.sessionVersion !== token.sessionVersion
        ) {
          throw new Error("Session has been revoked");
        }

        if (token.sessionToken) {
          const dbSession = await prisma.userSession.findUnique({
            where: { sessionToken: String(token.sessionToken) },
          });
          if (dbSession && dbSession.revokedAt) {
            throw new Error("Session has been revoked");
          }
        }

        session.user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          handle: dbUser.handle,
          role: dbUser.role as UserRole,
          plan: dbUser.plan,
          credits: dbUser.credits,
          dailyCredits: dbUser.dailyCredits,
          avatarUrl: dbUser.avatarUrl,
          bio: dbUser.bio,
          sessionToken: String(token.sessionToken || ""),
        };
      }
      return session;
    },
  },
};

export interface AuthenticatedUser {
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
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const u = session.user as AuthenticatedUser;
    if (!u.id) return null;
    return u;
  } catch {
    return null;
  }
}

const ROLE_WEIGHT: Record<UserRole, number> = {
  VIEWER: 1,
  MEMBER: 2,
  MODERATOR: 3,
  ADMIN: 4,
};

export function hasMinimumRole(userRole: string, requiredRole: UserRole): boolean {
  const actual = ROLE_WEIGHT[userRole as UserRole] ?? 0;
  const required = ROLE_WEIGHT[requiredRole] ?? 99;
  return actual >= required;
}
