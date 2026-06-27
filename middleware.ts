/**
 * Northbridge Motors — Staff Portal
 * Next.js Edge Middleware
 *
 * Uses the edge-safe auth config (lib/auth.config.ts) — no Prisma, no Node.js.
 * Full auth with Prisma lives in lib/auth.ts and is used in Server Components only.
 *
 * Responsibilities:
 * 1. Stamp x-pathname header on every request so the root layout can detect
 *    admin routes and suppress the public Header/Footer.
 * 2. Protect /admin routes — redirect unauthenticated requests to /admin/login.
 */

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-safe auth instance — uses JWT-only config, no Prisma
const { auth } = NextAuth({
  ...authConfig,
  basePath: "/admin/api/auth",
});

function withPathname(req: NextRequest) {
  return NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(req.headers),
        "x-pathname": req.nextUrl.pathname,
      }),
    },
  });
}

export default auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl;

  const publicPaths = ["/admin/login", "/admin/api/auth"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (isPublic) {
    // Already logged in — redirect away from login page
    if (pathname === "/admin/login" && (req as { auth?: unknown }).auth) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return withPathname(req);
  }

  // Protected admin routes — require a valid session
  if (pathname.startsWith("/admin")) {
    if (!(req as { auth?: unknown }).auth) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // All other routes — just stamp the pathname header
  return withPathname(req);
});

export const config = {
  matcher: [
    // Run on all routes so x-pathname is always available to the root layout.
    // Excludes Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};