import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { optionalAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    pinoHttp({
      logger,
    }),
  );
  app.use(optionalAuth);

  app.get("/", (_req, res) => {
    res.json({ success: true, message: "DocExtract Backend API" });
  });

  app.use("/api", apiRouter);
  app.use("/api/v1", apiRouter);

  app.use(errorHandler);

  return app;
}
