import { Router } from "express";
import { upload } from "../middleware/upload";
import {
  processDocument,
  getProcessingStatus,
  downloadExcel,
  getHistory,
} from "../controllers/ocrController";

export const ocrRouter = Router();

// Upload & process document
ocrRouter.post("/process", upload.single("document"), processDocument);

// Check processing status
ocrRouter.get("/status/:jobId", getProcessingStatus);

// Download Excel export
ocrRouter.get("/download/:jobId", downloadExcel);

// Get processing history
ocrRouter.get("/history", getHistory);
