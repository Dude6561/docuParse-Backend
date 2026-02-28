import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { ocrRouter } from "./routes/ocr";
import { healthRouter } from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files for exports/downloads
app.use(
  "/downloads",
  express.static(path.join(__dirname, "uploads", "exports")),
);

// Routes
app.use("/api/health", healthRouter);
app.use("/api/ocr", ocrRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 DocuParse API running on http://localhost:${PORT}`);
});

export default app;
