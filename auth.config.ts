/**
 * Northbridge Motors — Staff Portal
 * Edge-safe auth config (no Prisma, no Node.js APIs)
 *
 * This config is imported by middleware.ts which runs in the Edge Runtime.
 * It must contain NO Prisma, NO bcrypt, NO Node.js-only imports.
 *
 * Its only job is to tell NextAuth about JWT strategy and custom pages
 * so the middleware can verify the JWT token without hitting the database.
 */

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  // No providers here — Credentials uses bcrypt which isn't edge-safe.
  // The full provider is defined in lib/auth.ts for server-side use only.
  providers: [],

  callbacks: {
    // Middleware only needs to know: does a valid JWT exist?
    // Just return the token as-is — no DB calls.
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      // Minimal session for middleware — just needs to be truthy
      // The full session callback (with Prisma) lives in lib/auth.ts
      return session;
    },
  },
};