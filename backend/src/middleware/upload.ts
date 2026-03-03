import multer from "multer";
import { AppError } from "../types/index.js";
import { allowedMimeTypes, env } from "../config/env.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE,
  },
  fileFilter(_req, file, cb) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new AppError("Unsupported file type", 400, "UNSUPPORTED_FILE"));
      return;
    }
    cb(null, true);
  },
});
