export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface TransactionRow {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
  confidence?: number;
}

export interface DocumentSummary {
  documentType: string;
  bankName?: string;
  accountNumber?: string;
  totalDebit: number;
  totalCredit: number;
  transactionCount: number;
  currency: string;
  confidenceScore: number;
  signaturesDetected: number;
  tablesDetected: number;
}

export interface JobView {
  id: string;
  status: JobStatus;
  originalName: string;
  documentType: string;
  uploadedAt: string;
  completedAt?: string | null;
  error?: string | null;
  data?: {
    rawText: string;
    structured: TransactionRow[];
    summary: DocumentSummary;
  };
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
