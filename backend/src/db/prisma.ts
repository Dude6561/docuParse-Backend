import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Prevent multiple Prisma instances in development (hot-reload)
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
