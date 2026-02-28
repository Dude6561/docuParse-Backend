import { Router, Request, Response } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "DocuParse Nepal API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});
