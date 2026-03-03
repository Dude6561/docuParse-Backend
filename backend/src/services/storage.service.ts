import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const canUseSupabaseStorage = Boolean(
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY,
);

const supabase = canUseSupabaseStorage
  ? createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!)
  : null;

export async function uploadDocumentToStorage(params: {
  fileBuffer: Buffer;
  contentType: string;
  path: string;
}) {
  if (!supabase) {
    return { storagePath: null as string | null };
  }

  const { error } = await supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(params.path, params.fileBuffer, {
      contentType: params.contentType,
      upsert: true,
    });

  if (error) {
    logger.warn(
      { error, path: params.path },
      "Storage upload failed, continuing without remote storage",
    );
    return { storagePath: null as string | null };
  }

  return { storagePath: params.path };
}
