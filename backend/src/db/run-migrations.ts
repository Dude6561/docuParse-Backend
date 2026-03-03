import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";
import { logger } from "../config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const migrationDir = path.join(__dirname, "migrations");
  const files = (await readdir(migrationDir))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = await readFile(path.join(migrationDir, file), "utf-8");
    logger.info({ file }, "Running migration");
    await pool.query(sql);
  }

  logger.info("Migrations completed");
  await pool.end();
}

runMigrations().catch(async (error) => {
  logger.error({ error }, "Migration failed");
  await pool.end();
  process.exit(1);
});
