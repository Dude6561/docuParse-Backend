import { Pool, type QueryResultRow } from "pg";
import { env } from "../config/env.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});

export const query = <T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) => pool.query<T>(text, values);
