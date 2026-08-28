import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton.
 *
 * ARCHITECTURAL BOUNDARY: this module and `src/server/services/*` are the ONLY
 * places allowed to import from `@prisma/client`. Nothing under `src/app/` or
 * `src/components/` may import Prisma. See docs/ARCHITECTURE.md §2.
 *
 * The global cache prevents connection exhaustion from Next.js hot reloads in
 * development, where module state is discarded but the process is not.
 */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
