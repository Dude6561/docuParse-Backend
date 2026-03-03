import { v4 as uuidv4 } from "uuid";
import { DocumentType, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { analyzeWithTextract } from "./textract.service.js";
import {
  buildSummary,
  parseTransactionsFromTextract,
} from "./parser.service.js";
import { uploadDocumentToStorage } from "./storage.service.js";
import { logger } from "../config/logger.js";
import type { JobView } from "../types/index.js";
import type { DocumentSummary } from "../types/index.js";

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
    await prisma.processingJob.update({
      where: { id: params.jobId },
      data: {
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Unknown processing error",
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
          originalName: true,
          documentType: true,
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

  const structured = job.transactions.map((tx) => {
    const item = {
      date: tx.txDate ?? "",
      description: tx.description ?? "",
      debit: toNullableNumber(tx.debit),
      credit: toNullableNumber(tx.credit),
      balance: toNullableNumber(tx.balance),
    };

    const confidence = toOptionalNumber(tx.confidence);
    if (typeof confidence === "number") {
      return { ...item, confidence };
    }

    return item;
  });

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
    };
  }

  return base;
}

export async function getHistoryList(limit = 100) {
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

  return jobs.map((job) => ({
    id: job.id,
    originalName: job.document.originalName,
    status: job.status,
    documentType: job.document.documentType,
    uploadedAt: job.document.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
    transactionCount: job._count.transactions,
  }));
}
