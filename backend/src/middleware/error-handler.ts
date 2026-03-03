import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../types/index.js";
import { logger } from "../config/logger.js";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Invalid request payload",
      issues: error.issues,
      requestId: req.id,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
      requestId: req.id,
    });
  }

  logger.error({ err: error, requestId: req.id }, "Unhandled server error");
  return res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    requestId: req.id,
  });
};
