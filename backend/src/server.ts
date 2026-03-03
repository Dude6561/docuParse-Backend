import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "./db/prisma.js";

const app = createApp();

const DB_CONNECT_TIMEOUT_MS = 10_000;

function isPlaceholderUrl(url: string): boolean {
  return (
    url.includes("user:password@") ||
    url.includes("YOUR_") ||
    url === "postgresql://postgres:postgres@localhost:5432/docextract"
  );
}

async function connectWithTimeout(): Promise<void> {
  if (isPlaceholderUrl(env.DATABASE_URL)) {
    throw new Error(
      "DATABASE_URL is still a placeholder. Update your .env file with a real PostgreSQL connection string (e.g. from Supabase, Railway, Neon, or local Postgres).",
    );
  }

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            `Database connection timed out after ${DB_CONNECT_TIMEOUT_MS / 1000}s. Check your DATABASE_URL and ensure the database is reachable.`,
          ),
        ),
      DB_CONNECT_TIMEOUT_MS,
    ),
  );

  await Promise.race([prisma.$queryRaw`select 1`, timeout]);
}

async function boot() {
  try {
    await connectWithTimeout();
    logger.info("Database connected");
  } catch (error) {
    logger.error({ error }, "Database connection failed");
    logger.error(
      "Hint: Set a valid DATABASE_URL in backend/.env — e.g. your Supabase or Railway PostgreSQL connection string.",
    );
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "DocExtract backend is running");
  });
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

void boot();
