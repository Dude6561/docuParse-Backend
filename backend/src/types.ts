export interface OcrJob {
  id: string;
  fileName: string;
  originalName: string;
  status: "pending" | "processing" | "completed" | "failed";
  documentType: string;
  uploadedAt: Date;
  completedAt?: Date;
  extractedData?: ExtractedData;
  exportPath?: string;
  error?: string;
}

export interface ExtractedData {
  rawText: string;
  structured: ParsedTransaction[];
  summary: DocumentSummary;
}

export interface ParsedTransaction {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
}

export interface DocumentSummary {
  documentType: string;
  bankName?: string;
  accountNumber?: string;
  totalDebit: number;
  totalCredit: number;
  transactionCount: number;
  currency: string;
}

export interface ProcessResponse {
  success: boolean;
  jobId?: string;
  message: string;
  data?: ExtractedData;
}
