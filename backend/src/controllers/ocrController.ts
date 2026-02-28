import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { OcrJob } from "../types";
import { extractText } from "../utils/ocrEngine";
import { parseStatement } from "../utils/parser";
import { generateExcel } from "../utils/excelExporter";

// In-memory job store (replace with DB for production)
const jobs = new Map<string, OcrJob>();

export const processDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const jobId = uuidv4();
    const documentType = (req.body.documentType as string) || "bank_statement";

    const job: OcrJob = {
      id: jobId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      status: "pending",
      documentType,
      uploadedAt: new Date(),
    };

    jobs.set(jobId, job);

    // Return immediately, process async
    res.status(202).json({
      success: true,
      jobId,
      message: "Document uploaded. Processing started.",
    });

    // Process in background
    processInBackground(job, req.file.path);
  } catch (err) {
    next(err);
  }
};

const processInBackground = async (
  job: OcrJob,
  filePath: string,
): Promise<void> => {
  try {
    job.status = "processing";
    jobs.set(job.id, job);

    console.log(`Processing job ${job.id}: ${job.originalName}`);

    // Step 1: OCR - Extract text
    const rawText = await extractText(filePath);

    // Step 2: Parse structured data
    const extractedData = parseStatement(rawText, job.documentType);

    // Step 3: Generate Excel
    const exportFileName = generateExcel(extractedData, job.id);

    // Update job
    job.status = "completed";
    job.completedAt = new Date();
    job.extractedData = extractedData;
    job.exportPath = exportFileName;
    jobs.set(job.id, job);

    console.log(
      `Job ${job.id} completed. Found ${extractedData.structured.length} transactions.`,
    );

    // Cleanup uploaded file after processing
    try {
      fs.unlinkSync(filePath);
    } catch {
      // Ignore cleanup errors
    }
  } catch (err: any) {
    job.status = "failed";
    job.error = err.message || "Processing failed";
    jobs.set(job.id, job);
    console.error(`Job ${job.id} failed:`, err.message);
  }
};

export const getProcessingStatus = (req: Request, res: Response): void => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    res.status(404).json({ success: false, message: "Job not found" });
    return;
  }

  res.json({
    success: true,
    job: {
      id: job.id,
      status: job.status,
      originalName: job.originalName,
      documentType: job.documentType,
      uploadedAt: job.uploadedAt,
      completedAt: job.completedAt,
      error: job.error,
      data: job.status === "completed" ? job.extractedData : undefined,
    },
  });
};

export const downloadExcel = (req: Request, res: Response): void => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    res.status(404).json({ success: false, message: "Job not found" });
    return;
  }

  if (job.status !== "completed" || !job.exportPath) {
    res.status(400).json({ success: false, message: "Export not ready yet" });
    return;
  }

  const filePath = path.resolve("./src/uploads/exports", job.exportPath);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ success: false, message: "Export file not found" });
    return;
  }

  res.download(filePath, `DocuParse_${job.originalName}.xlsx`);
};

export const getHistory = (_req: Request, res: Response): void => {
  const allJobs = Array.from(jobs.values())
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    )
    .map((job) => ({
      id: job.id,
      originalName: job.originalName,
      status: job.status,
      documentType: job.documentType,
      uploadedAt: job.uploadedAt,
      completedAt: job.completedAt,
      transactionCount: job.extractedData?.summary?.transactionCount || 0,
    }));

  res.json({ success: true, jobs: allJobs });
};
