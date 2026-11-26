import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateCredentials } from "@/modules/auth/service";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/modules/auth/schemas";
import {
  AccountDisabled,
  AuthRateLimited,
  EmailNotVerified,
  InvalidCredentials,
} from "@/modules/auth/errors";

/**
 * Auth.js (next-auth v5) — Credentials + JWT.
 * Database session strategy is incompatible with Credentials; JWT sessions are
 * validated against user status on each refresh. Session revocation for
 * suspended/blocked accounts is enforced in the jwt callback.
 */
const SESSION_RECHECK_MS = 5 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or phone", type: "text" },
        password: { label: "Password", type: "password" },
        // Passed from the API route for rate-limit bucketing
        ip: { label: "ip", type: "text" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse({
          identifier: credentials?.identifier,
          password: credentials?.password,
        });
        if (!parsed.success) return null;

        const result = await authenticateCredentials({
          identifier: parsed.data.identifier,
          password: parsed.data.password,
          ip:
            typeof credentials?.ip === "string" && credentials.ip
              ? credentials.ip
              : "unknown",
        });

        if (!result.ok) {
          if (result.code === "EMAIL_NOT_VERIFIED") throw new EmailNotVerified();
          if (result.code === "ACCOUNT_DISABLED") throw new AccountDisabled();
          if (result.code === "RATE_LIMITED") throw new AuthRateLimited();
          throw new InvalidCredentials();
        }

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          status: result.user.status,
          phone: result.user.phone,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/en/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.status = user.status;
        token.phone = user.phone ?? null;
        token.checkedAt = Date.now();
        return token;
      }
      // Re-read role and status every few minutes so suspensions, blocks and
      // role changes apply to existing sessions instead of after 30 days.
      const checkedAt = typeof token.checkedAt === "number" ? token.checkedAt : 0;
      if (token.id && Date.now() - checkedAt > SESSION_RECHECK_MS) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, status: true, phone: true },
        });
        if (!fresh || fresh.status === "SUSPENDED" || fresh.status === "BLOCKED") {
          return null;
        }
        token.role = fresh.role;
        token.status = fresh.status;
        token.phone = fresh.phone ?? null;
        token.checkedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
        session.user.status = token.status as typeof session.user.status;
        session.user.phone = (token.phone as string | null | undefined) ?? null;
      }
      return session;
    },
  },
  trustHost: true,
});
