import { Router } from "express";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { upload } from "../middleware/upload.js";
import { AppError } from "../types/index.js";
import {
  createDocumentJob,
  getJobDocumentInfo,
  getHistoryList,
  getJobDetails,
  processDocumentJob,
  updateReviewedTransactions,
} from "../services/document.service.js";
import { enqueue } from "../jobs/in-memory-queue.js";
import {
  buildCsvString,
  buildExcelBuffer,
} from "../services/export.service.js";
import { resolveLocalDocumentPath } from "../services/storage.service.js";

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

const reviewUpdateSchema = z.object({
  rows: z
    .array(
      z.object({
        rowIndex: z.number().int().min(0),
        date: z.string().optional(),
        description: z.string().optional(),
        debit: z.number().nullable().optional(),
        credit: z.number().nullable().optional(),
        balance: z.number().nullable().optional(),
      }),
    )
    .min(1),
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

ocrRouter.post(
  "/process-batch",
  upload.array("documents", 25),
  async (req, res, next) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        throw new AppError("No documents uploaded", 400, "MISSING_FILE");
      }

      const parsed = uploadSchema.parse({
        documentType: req.body.documentType ?? "other",
      });

      const jobs: Array<{ jobId: string; fileName: string }> = [];
      for (const file of files) {
        const created = await createDocumentJob({
          file,
          documentType: parsed.documentType,
          userId: req.userId,
        });

        jobs.push({
          jobId: created.jobId,
          fileName: file.originalname,
        });

        enqueue(async () => {
          await processDocumentJob({
            jobId: created.jobId,
            fileBuffer: created.fileBuffer,
            documentType: parsed.documentType,
          });
        });
      }

      res.status(202).json({
        success: true,
        jobs,
        message: `${jobs.length} document(s) uploaded. Processing started.`,
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

ocrRouter.put("/review/:id", async (req, res, next) => {
  try {
    const parsed = reviewUpdateSchema.parse(req.body);
    const updatedJob = await updateReviewedTransactions({
      jobId: req.params.id,
      userId: req.userId,
      rows: parsed.rows,
    });

    if (!updatedJob) {
      throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
    }

    res.json({ success: true, job: updatedJob });
  } catch (error) {
    next(error);
  }
});

ocrRouter.get("/document/:id", async (req, res, next) => {
  try {
    const documentInfo = await getJobDocumentInfo(req.params.id);
    if (!documentInfo || !documentInfo.storagePath) {
      throw new AppError(
        "Original document not available",
        404,
        "DOCUMENT_NOT_FOUND",
      );
    }

    if (!documentInfo.storagePath.startsWith("local://")) {
      throw new AppError(
        "Preview is only available for locally stored documents",
        400,
        "DOCUMENT_PREVIEW_UNAVAILABLE",
      );
    }

    const filePath = resolveLocalDocumentPath(documentInfo.storagePath);
    const fileBuffer = await readFile(filePath);
    res.setHeader(
      "Content-Type",
      documentInfo.mimeType || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${documentInfo.originalName}"`,
    );
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
});
