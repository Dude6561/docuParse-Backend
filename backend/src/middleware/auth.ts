import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const optionalAuth: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const headerUser = req.headers["x-user-id"];
    if (typeof headerUser === "string" && headerUser.length > 0) {
      req.userId = headerUser;
    }
    return next();
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!env.SUPABASE_JWT_SECRET) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET) as {
      sub?: string;
      user_id?: string;
    };
    req.userId = payload.sub ?? payload.user_id;
  } catch {
    req.userId = undefined;
  }

  return next();
};
