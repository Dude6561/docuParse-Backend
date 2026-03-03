import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(5001),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default("documents"),
  SUPABASE_JWT_SECRET: z.string().optional(),
  AWS_REGION: z.string().default("ap-south-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  MAX_FILE_SIZE: z.coerce.number().default(10 * 1024 * 1024),
  ALLOWED_MIME_TYPES: z
    .string()
    .default("application/pdf,image/jpeg,image/png,image/webp,image/tiff"),
  JOB_POLL_INTERVAL_MS: z.coerce.number().default(2000),
});

export const env = envSchema.parse(process.env);

export const allowedMimeTypes = env.ALLOWED_MIME_TYPES.split(",").map((item) =>
  item.trim(),
);

export const isProduction = env.NODE_ENV === "production";
