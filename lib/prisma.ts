import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const adapter = new PrismaNeon({ connectionString: url });

  const isDev = process.env.NODE_ENV !== "production";

  const client = new PrismaClient({
    adapter,
    log: isDev
      ? [
          { emit: "event", level: "query" },
          { emit: "event", level: "warn" },
          { emit: "event", level: "error" },
        ]
      : [{ emit: "event", level: "error" }],
  } as never);

  if (isDev) {
    (client.$on as (...args: unknown[]) => void)("query", (e: { query: string; duration: number; params: string }) => {
      if (e.duration > 500) {
        logger.warn(`Slow query (${e.duration}ms): ${e.query}`, "prisma", {
          duration: e.duration,
          params: e.params,
        });
      }
    });
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
