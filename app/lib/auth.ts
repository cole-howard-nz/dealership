/**
 * Northbridge Motors — Staff Portal
 * NextAuth (Auth.js v5) configuration
 *
 * Auth.js v5 constraint: Credentials provider requires JWT strategy.
 * Database session storage is incompatible with Credentials in v5.
 *
 * Strategy used:
 * - JWT sessions (required by Credentials provider in Auth.js v5)
 * - On every session read, we re-fetch the user from DB to pick up
 *   role/location changes and detect deactivated accounts immediately.
 *   This gives us the key benefit of database sessions (freshness) while
 *   satisfying the JWT requirement.
 * - No PrismaAdapter — incompatible with Credentials + JWT in v5.
 * - Audit logging done directly in authorize() and signOut event.
 */

import NextAuth, { type NextAuthConfig, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ─── Validation schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Auth config ──────────────────────────────────────────────────────────────

const authConfig: NextAuthConfig = {
  // JWT is required when using Credentials provider in Auth.js v5
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            role: {
              select: { id: true, name: true, isSystem: true, permissions: true },
            },
            locations: {
              include: {
                location: { select: { id: true, name: true, isActive: true } },
              },
            },
          },
        });

        if (!user || !user.passwordHash || !user.isActive) return null;

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
          await prisma.auditLog.create({
            data: {
              action: "LOGIN_FAILED",
              entityType: "User",
              entityId: user.id,
              metadata: { email },
            },
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: "LOGIN",
            entityType: "User",
            entityId: user.id,
          },
        });

        // Return minimal user — only id is stored in the JWT token.
        // Full user data is fetched fresh on every session() call below.
        return { id: user.id };
      },
    }),
  ],

  callbacks: {
    // Store only the user id in the JWT token
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },

    // On every request, re-fetch fresh user data from the DB.
    // This ensures role/permission/location changes apply immediately,
    // and deactivated accounts are blocked without waiting for token expiry.
    async session({ session, token }) {
      const userId = token.userId as string | undefined;
      if (!userId) throw new Error("No userId in token");

      const freshUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            select: { id: true, name: true, isSystem: true, permissions: true },
          },
          locations: {
            include: {
              location: { select: { id: true, name: true, isActive: true } },
            },
          },
        },
      });

      if (!freshUser || !freshUser.isActive) {
        // Middleware will catch the missing session.user and redirect to login
        throw new Error("Account deactivated");
      }

      // Cast needed: @auth/prisma-adapter (still in node_modules) injects
      // AdapterUser into the session type, requiring emailVerified. We are not
      // using the adapter at runtime — this cast suppresses the type bleed.
      (session as any).user = {
        id: freshUser.id,
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
        locations: freshUser.locations
          .filter((ul) => ul.location.isActive)
          .map((ul) => ul.location),
      };

      return session;
    },
  },

  events: {
    async signOut(event) {
      const token = (event as any)?.token;
      const userId = token?.userId as string | undefined;
      if (userId) {
        await prisma.auditLog.create({
          data: {
            actorId: userId,
            action: "LOGOUT",
            entityType: "User",
            entityId: userId,
          },
        });
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  basePath: "/admin/api/auth",
});

// ─── Type augmentation ────────────────────────────────────────────────────────

// Extend next-auth types with portal-specific session and JWT fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: {
        id: string;
        name: string;
        isSystem: boolean;
        permissions: string[];
      };
      locations: Array<{
        id: string;
        name: string;
        isActive: boolean;
      }>;
    };
  }

  // JWT is augmented here (not next-auth/jwt) in Auth.js v5
  interface JWT {
    userId?: string;
  }
}