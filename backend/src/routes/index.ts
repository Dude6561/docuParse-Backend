import { Router } from "express";
import { healthRouter } from "./health.route.js";
import { ocrRouter } from "./ocr.route.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/ocrr", ocrRouter);
