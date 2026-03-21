import { v4 as uuidv4 } from "uuid";
import { DocumentType, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { analyzeWithTextract } from "./textract.service.js";
import {
  buildSummary,
  extractChequeReference,
  parseTransactionsFromTextract,
} from "./parser.service.js";
import { uploadDocumentToStorage } from "./storage.service.js";
import { logger } from "../config/logger.js";
import type { JobView } from "../types/index.js";
import type { DocumentSummary } from "../types/index.js";
import type { AuditLogEntry, TransactionRow } from "../types/index.js";
import type { HistoryJobView } from "../types/index.js";
import { AppError } from "../types/index.js";

function toDocumentType(value: string): DocumentType {
  const map: Record<string, DocumentType> = {
    bank_statement: DocumentType.bank_statement,
    invoice: DocumentType.invoice,
    receipt: DocumentType.receipt,
    tax_document: DocumentType.tax_document,
    citizenship: DocumentType.citizenship,
    other: DocumentType.other,
  };

  return map[value] ?? DocumentType.other;
}

function toNullableNumber(value: Prisma.Decimal | null): number | null {
  return value ? Number(value.toString()) : null;
}

function toOptionalNumber(value: Prisma.Decimal | null): number | undefined {
  return value ? Number(value.toString()) : undefined;
}

function computeDuplicateKeys(rows: TransactionRow[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = [
      row.date,
      row.description.trim().toLowerCase(),
      row.debit ?? "",
      row.credit ?? "",
      row.balance ?? "",
    ].join("|");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([key]) => key),
  );
}

function withDuplicateFlags(rows: TransactionRow[]) {
  const duplicateKeys = computeDuplicateKeys(rows);
  return rows.map((row) => {
    const key = [
      row.date,
      row.description.trim().toLowerCase(),
      row.debit ?? "",
      row.credit ?? "",
      row.balance ?? "",
    ].join("|");

    return {
      ...row,
      duplicate: duplicateKeys.has(key),
    };
  });
}

function getAuditLog(
  metrics: Prisma.JsonValue | null,
  uploadedAt: Date,
  uploadedBy: string | null,
  completedAt: Date | null,
): AuditLogEntry[] {
  const edits =
    metrics && typeof metrics === "object" && !Array.isArray(metrics)
      ? ((metrics as Record<string, unknown>).edits as
          | Array<Record<string, unknown>>
          | undefined)
      : undefined;

  const auditLog: AuditLogEntry[] = [
    {
      action: "uploaded",
      at: uploadedAt.toISOString(),
      by: uploadedBy,
    },
  ];

  if (completedAt) {
    auditLog.push({
      action: "processed",
      at: completedAt.toISOString(),
      by: null,
    });
  }

  for (const edit of edits ?? []) {
    if (typeof edit.at !== "string") {
      continue;
    }
    auditLog.push({
      action: "edited",
      at: edit.at,
      by: typeof edit.by === "string" ? edit.by : null,
      note:
        typeof edit.note === "string"
          ? edit.note
          : typeof edit.count === "number"
            ? `${edit.count} rows updated`
            : undefined,
    });
  }

  return auditLog;
}

function classifyProcessingFailure(error: unknown): string {
  const message =
    error instanceof Error ? error.message.toLowerCase() : "unknown_error";

  if (message.includes("unsupported") || message.includes("mime")) {
    return "unsupported_file";
  }
  if (message.includes("size") || message.includes("large")) {
    return "file_too_large";
  }
  if (message.includes("textract") || message.includes("aws")) {
    return "ocr_provider_error";
  }
  if (message.includes("timeout") || message.includes("timed out")) {
    return "ocr_timeout";
  }
  if (message.includes("parse") || message.includes("format")) {
    return "parse_error";
  }
  return "processing_error";
}

export async function createDocumentJob(params: {
  file: Express.Multer.File;
  documentType: string;
  userId: string | undefined;
}) {
  const storagePath = `uploads/${new Date().toISOString().slice(0, 10)}/${uuidv4()}-${params.file.originalname}`;
  const uploadResult = await uploadDocumentToStorage({
    fileBuffer: params.file.buffer,
    contentType: params.file.mimetype,
    path: storagePath,
  });

  const document = await prisma.document.create({
    data: {
      uploadedBy: params.userId ?? null,
      documentType: toDocumentType(params.documentType),
      originalName: params.file.originalname,
      mimeType: params.file.mimetype,
      sizeBytes: BigInt(params.file.size),
      storagePath: uploadResult.storagePath,
    },
    select: {
      id: true,
    },
  });

  const job = await prisma.processingJob.create({
    data: {
      documentId: document.id,
      status: "pending",
    },
    select: {
      id: true,
    },
  });

  return {
    jobId: job.id,
    fileBuffer: params.file.buffer,
    documentType: params.documentType,
  };
}

export async function processDocumentJob(params: {
  jobId: string;
  fileBuffer: Buffer;
  documentType: string;
}) {
  await prisma.processingJob.update({
    where: { id: params.jobId },
    data: {
      status: "processing",
      startedAt: new Date(),
    },
  });

  try {
    const textract = await analyzeWithTextract(params.fileBuffer);
    const transactions = parseTransactionsFromTextract(textract.blocks);
    const summary = buildSummary({
      rawText: textract.rawText,
      documentType: params.documentType,
      transactionRows: transactions,
      confidenceScore: textract.confidenceScore,
      signaturesDetected: textract.signatureBlocks.length,
      tablesDetected: textract.tableCount,
    });

    await prisma.$transaction([
      prisma.extractedTransaction.deleteMany({
        where: { jobId: params.jobId },
      }),
      prisma.extractedSignature.deleteMany({
        where: { jobId: params.jobId },
      }),
    ]);

    if (transactions.length > 0) {
      await prisma.extractedTransaction.createMany({
        data: transactions.map((row, index) => ({
          jobId: params.jobId,
          rowIndex: index,
          txDate: row.date || null,
          description: row.description || null,
          debit:
            typeof row.debit === "number"
              ? new Prisma.Decimal(row.debit)
              : null,
          credit:
            typeof row.credit === "number"
              ? new Prisma.Decimal(row.credit)
              : null,
          balance:
            typeof row.balance === "number"
              ? new Prisma.Decimal(row.balance)
              : null,
          confidence:
            typeof row.confidence === "number"
              ? new Prisma.Decimal(row.confidence)
              : null,
        })),
      });
    }

    if (textract.signatureBlocks.length > 0) {
      await prisma.extractedSignature.createMany({
        data: textract.signatureBlocks.map((block) => ({
          jobId: params.jobId,
          page: block.Page ?? null,
          confidence:
            typeof block.Confidence === "number"
              ? new Prisma.Decimal(block.Confidence)
              : null,
        })),
      });
    }

    await prisma.processingJob.update({
      where: { id: params.jobId },
      data: {
        status: "completed",
        rawText: textract.rawText,
        summary: summary as unknown as Prisma.InputJsonValue,
        metrics: {
          tableCount: textract.tableCount,
          signaturesDetected: textract.signatureBlocks.length,
          confidenceScore: textract.confidenceScore,
        } as unknown as Prisma.InputJsonValue,
        textractPayload: {
          blocks: textract.blocks,
        } as unknown as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error({ error, jobId: params.jobId }, "Processing job failed");
    const failureReason = classifyProcessingFailure(error);
    await prisma.processingJob.update({
      where: { id: params.jobId },
      data: {
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Unknown processing error",
        metrics: {
          failureReason,
        } as unknown as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });
  }
}

export async function getJobDetails(jobId: string): Promise<JobView | null> {
  const job = await prisma.processingJob.findUnique({
    where: { id: jobId },
    include: {
      document: {
        select: {
          id: true,
          originalName: true,
          documentType: true,
          uploadedBy: true,
          storagePath: true,
          mimeType: true,
          createdAt: true,
        },
      },
      transactions: {
        orderBy: {
          rowIndex: "asc",
        },
      },
    },
  });

  if (!job) {
    return null;
  }

  const structuredBase = job.transactions.map((tx) => {
    const confidence = toOptionalNumber(tx.confidence);
    const item = {
      rowIndex: tx.rowIndex,
      date: tx.txDate ?? "",
      description: tx.description ?? "",
      chequeRef: extractChequeReference(tx.description ?? ""),
      debit: toNullableNumber(tx.debit),
      credit: toNullableNumber(tx.credit),
      balance: toNullableNumber(tx.balance),
    };

    if (typeof confidence === "number") {
      return {
        ...item,
        confidence,
        lowConfidence: confidence < 80,
      };
    }

    return item;
  });

  const structured = withDuplicateFlags(structuredBase);
  const duplicateCount = structured.filter((row) => row.duplicate).length;
  const lowConfidenceCount = structured.filter(
    (row) => row.lowConfidence,
  ).length;

  const base: JobView = {
    id: job.id,
    status: job.status,
    originalName: job.document.originalName,
    documentType: job.document.documentType,
    uploadedAt: job.document.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
    error: job.errorMessage,
  };

  if (job.status === "completed") {
    base.data = {
      rawText: job.rawText ?? "",
      structured,
      summary: (job.summary ?? {
        documentType: job.document.documentType,
        totalDebit: 0,
        totalCredit: 0,
        transactionCount: structured.length,
        currency: "NPR",
        confidenceScore: 0,
        signaturesDetected: 0,
        tablesDetected: 0,
      }) as unknown as DocumentSummary,
      review: {
        duplicateCount,
        lowConfidenceCount,
      },
      auditLog: getAuditLog(
        job.metrics,
        job.document.createdAt,
        job.document.uploadedBy,
        job.completedAt,
      ),
    };
  }

  return base;
}

export async function updateReviewedTransactions(params: {
  jobId: string;
  userId: string | undefined;
  rows: Array<{
    rowIndex: number;
    date?: string;
    description?: string;
    debit?: number | null;
    credit?: number | null;
    balance?: number | null;
  }>;
}) {
  const job = await prisma.processingJob.findUnique({
    where: { id: params.jobId },
    include: {
      document: {
        select: {
          documentType: true,
          originalName: true,
        },
      },
      transactions: {
        orderBy: {
          rowIndex: "asc",
        },
      },
    },
  });

  if (!job) {
    throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
  }

  if (job.status !== "completed") {
    throw new AppError(
      "Only completed jobs can be edited",
      400,
      "JOB_NOT_EDITABLE",
    );
  }

  const availableRowIndexes = new Set(
    job.transactions.map((row) => row.rowIndex),
  );
  for (const row of params.rows) {
    if (!availableRowIndexes.has(row.rowIndex)) {
      throw new AppError(
        `Row ${row.rowIndex} not found for this job`,
        400,
        "INVALID_ROW_INDEX",
      );
    }
  }

  await prisma.$transaction(
    params.rows.map((row) =>
      prisma.extractedTransaction.updateMany({
        where: {
          jobId: params.jobId,
          rowIndex: row.rowIndex,
        },
        data: {
          txDate: row.date ?? undefined,
          description: row.description ?? undefined,
          debit:
            typeof row.debit === "number"
              ? new Prisma.Decimal(row.debit)
              : row.debit === null
                ? null
                : undefined,
          credit:
            typeof row.credit === "number"
              ? new Prisma.Decimal(row.credit)
              : row.credit === null
                ? null
                : undefined,
          balance:
            typeof row.balance === "number"
              ? new Prisma.Decimal(row.balance)
              : row.balance === null
                ? null
                : undefined,
        },
      }),
    ),
  );

  const refreshed = await prisma.extractedTransaction.findMany({
    where: { jobId: params.jobId },
    orderBy: { rowIndex: "asc" },
  });

  const transactionRows: TransactionRow[] = refreshed.map((tx) => ({
    rowIndex: tx.rowIndex,
    date: tx.txDate ?? "",
    description: tx.description ?? "",
    chequeRef: extractChequeReference(tx.description ?? ""),
    debit: toNullableNumber(tx.debit),
    credit: toNullableNumber(tx.credit),
    balance: toNullableNumber(tx.balance),
    confidence: toOptionalNumber(tx.confidence),
    lowConfidence:
      typeof toOptionalNumber(tx.confidence) === "number"
        ? (toOptionalNumber(tx.confidence) ?? 0) < 80
        : undefined,
  }));

  const metricsObj =
    job.metrics &&
    typeof job.metrics === "object" &&
    !Array.isArray(job.metrics)
      ? ({ ...(job.metrics as Record<string, unknown>) } as Record<
          string,
          unknown
        >)
      : {};
  const edits = Array.isArray(metricsObj.edits)
    ? (metricsObj.edits as Array<Record<string, unknown>>)
    : [];

  edits.push({
    at: new Date().toISOString(),
    by: params.userId ?? null,
    count: params.rows.length,
  });
  metricsObj.edits = edits;

  const summary = buildSummary({
    rawText: job.rawText ?? "",
    documentType: job.document.documentType,
    transactionRows,
    confidenceScore:
      typeof metricsObj.confidenceScore === "number"
        ? metricsObj.confidenceScore
        : transactionRows.length > 0
          ? Number(
              (
                transactionRows.reduce(
                  (sum, row) => sum + (row.confidence ?? 0),
                  0,
                ) / transactionRows.length
              ).toFixed(2),
            )
          : 0,
    signaturesDetected:
      typeof metricsObj.signaturesDetected === "number"
        ? metricsObj.signaturesDetected
        : 0,
    tablesDetected:
      typeof metricsObj.tableCount === "number" ? metricsObj.tableCount : 0,
  });

  await prisma.processingJob.update({
    where: { id: params.jobId },
    data: {
      summary: summary as unknown as Prisma.InputJsonValue,
      metrics: metricsObj as unknown as Prisma.InputJsonValue,
      updatedAt: new Date(),
    },
  });

  return getJobDetails(params.jobId);
}

export async function getJobDocumentInfo(jobId: string) {
  const job = await prisma.processingJob.findUnique({
    where: { id: jobId },
    include: {
      document: {
        select: {
          storagePath: true,
          mimeType: true,
          originalName: true,
        },
      },
    },
  });

  if (!job) {
    return null;
  }

  return job.document;
}

export async function getHistoryList(limit = 100): Promise<HistoryJobView[]> {
  const jobs = await prisma.processingJob.findMany({
    take: Math.max(1, Math.min(limit, 500)),
    orderBy: {
      createdAt: "desc",
    },
    include: {
      document: {
        select: {
          originalName: true,
          documentType: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  return jobs.map((job) => {
    const summaryObj =
      job.summary &&
      typeof job.summary === "object" &&
      !Array.isArray(job.summary)
        ? (job.summary as Record<string, unknown>)
        : {};
    const metricsObj =
      job.metrics &&
      typeof job.metrics === "object" &&
      !Array.isArray(job.metrics)
        ? (job.metrics as Record<string, unknown>)
        : {};

    return {
      id: job.id,
      originalName: job.document.originalName,
      status: job.status,
      documentType: job.document.documentType,
      uploadedAt: job.document.createdAt.toISOString(),
      completedAt: job.completedAt?.toISOString() ?? null,
      transactionCount: job._count.transactions,
      confidenceScore:
        typeof summaryObj.confidenceScore === "number"
          ? summaryObj.confidenceScore
          : undefined,
      balanceCheckPassed:
        typeof summaryObj.balanceCheckPassed === "boolean"
          ? summaryObj.balanceCheckPassed
          : undefined,
      duplicateCount:
        typeof summaryObj.duplicateCount === "number"
          ? summaryObj.duplicateCount
          : undefined,
      lowConfidenceCount:
        typeof summaryObj.lowConfidenceCount === "number"
          ? summaryObj.lowConfidenceCount
          : undefined,
      failureReason:
        typeof metricsObj.failureReason === "string"
          ? metricsObj.failureReason
          : null,
    };
  });
}
