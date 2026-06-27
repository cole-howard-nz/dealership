/**
 * Northbridge Motors — Staff Portal
 * Prisma singleton
 *
 * In development, Next.js hot-reloading can create multiple Prisma instances.
 * This pattern re-uses a single global instance to avoid connection pool
 * exhaustion during development.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
