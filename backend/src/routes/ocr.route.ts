import { Router } from "express";
import { z } from "zod";
import { upload } from "../middleware/upload.js";
import { AppError } from "../types/index.js";
import {
  createDocumentJob,
  getHistoryList,
  getJobDetails,
  processDocumentJob,
} from "../services/document.service.js";
import { enqueue } from "../jobs/in-memory-queue.js";
import {
  buildCsvString,
  buildExcelBuffer,
} from "../services/export.service.js";

export const ocrRouter = Router();

const uploadSchema = z.object({
  documentType: z
    .enum([
      "bank_statement",
      "invoice",
      "receipt",
      "tax_document",
      "citizenship",
      "other",
    ])
    .default("other"),
});

ocrRouter.post(
  "/process",
  upload.single("document"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError("No document uploaded", 400, "MISSING_FILE");
      }

      const parsed = uploadSchema.parse({
        documentType: req.body.documentType ?? "other",
      });

      const created = await createDocumentJob({
        file: req.file,
        documentType: parsed.documentType,
        userId: req.userId,
      });

      enqueue(async () => {
        await processDocumentJob({
          jobId: created.jobId,
          fileBuffer: created.fileBuffer,
          documentType: parsed.documentType,
        });
      });

      res.status(202).json({
        success: true,
        jobId: created.jobId,
        message: "Document uploaded. Processing started.",
      });
    } catch (error) {
      next(error);
    }
  },
);

ocrRouter.get("/status/:id", async (req, res, next) => {
  try {
    const job = await getJobDetails(req.params.id);
    if (!job) {
      throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
    }
    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
});

ocrRouter.get("/history", async (req, res, next) => {
  try {
    const parsedLimit = req.query.limit ? Number(req.query.limit) : 100;
    const limit = Number.isFinite(parsedLimit) ? parsedLimit : 100;
    const jobs = await getHistoryList(limit);
    res.json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
});

ocrRouter.get("/download/:id", async (req, res, next) => {
  try {
    const format = req.query.format === "csv" ? "csv" : "xlsx";
    const job = await getJobDetails(req.params.id);

    if (!job || job.status !== "completed" || !job.data) {
      throw new AppError(
        "Document is not ready for download",
        400,
        "JOB_NOT_COMPLETED",
      );
    }

    if (format === "csv") {
      const csv = buildCsvString(job.data.structured);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${job.originalName.replace(/\.[^/.]+$/, "")}.csv"`,
      );
      return res.send(csv);
    }

    const workbookBuffer = await buildExcelBuffer({
      originalName: job.originalName,
      summary: job.data.summary,
      transactions: job.data.structured,
      rawText: job.data.rawText,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${job.originalName.replace(/\.[^/.]+$/, "")}.xlsx"`,
    );
    return res.send(Buffer.from(workbookBuffer));
  } catch (error) {
    next(error);
  }
});
