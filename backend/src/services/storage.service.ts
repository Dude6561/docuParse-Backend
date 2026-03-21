import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const canUseSupabaseStorage = Boolean(
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY,
);

const supabase = canUseSupabaseStorage
  ? createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!)
  : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localUploadsRoot = path.resolve(__dirname, "../../.uploads");

function normalizeStoragePath(inputPath: string) {
  return inputPath.replace(/^\/+/, "");
}

export function resolveLocalDocumentPath(storagePath: string) {
  const normalized = storagePath.startsWith("local://")
    ? storagePath.slice("local://".length)
    : storagePath;

  return path.resolve(localUploadsRoot, normalizeStoragePath(normalized));
}

export async function uploadDocumentToStorage(params: {
  fileBuffer: Buffer;
  contentType: string;
  path: string;
}) {
  const normalizedPath = normalizeStoragePath(params.path);
  const localAbsolutePath = resolveLocalDocumentPath(
    `local://${normalizedPath}`,
  );

  await mkdir(path.dirname(localAbsolutePath), { recursive: true });
  await writeFile(localAbsolutePath, params.fileBuffer);

  if (!supabase) {
    return { storagePath: `local://${normalizedPath}` };
  }

  const { error } = await supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(normalizedPath, params.fileBuffer, {
      contentType: params.contentType,
      upsert: true,
    });

  if (error) {
    logger.warn(
      { error, path: params.path },
      "Storage upload failed, continuing without remote storage",
    );
    return { storagePath: `local://${normalizedPath}` };
  }

  return { storagePath: `local://${normalizedPath}` };
}
