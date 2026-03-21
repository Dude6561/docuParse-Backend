export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface TransactionRow {
  rowIndex?: number;
  date: string;
  description: string;
  chequeRef?: string | null;
  debit: number | null;
  credit: number | null;
  balance: number | null;
  confidence?: number;
  lowConfidence?: boolean;
  duplicate?: boolean;
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
  openingBalance?: number | null;
  closingBalance?: number | null;
  calculatedClosingBalance?: number | null;
  balanceDifference?: number | null;
  balanceCheckPassed?: boolean;
  parserProfile?: string;
  duplicateCount?: number;
  lowConfidenceCount?: number;
  balanceContinuityIssues?: number;
  invalidDateCount?: number;
  scanQuality?: "good" | "fair" | "poor";
}

export interface HistoryJobView {
  id: string;
  originalName: string;
  status: string;
  documentType: string;
  uploadedAt: string;
  completedAt?: string | null;
  transactionCount: number;
  confidenceScore?: number;
  balanceCheckPassed?: boolean;
  duplicateCount?: number;
  lowConfidenceCount?: number;
  failureReason?: string | null;
}

export interface AuditLogEntry {
  action: "uploaded" | "processed" | "edited";
  at: string;
  by: string | null;
  note?: string;
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
    review: {
      duplicateCount: number;
      lowConfidenceCount: number;
    };
    auditLog: AuditLogEntry[];
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
