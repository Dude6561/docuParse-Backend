import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 120_000,
  withCredentials: true,
});

// Attach session token when available (for server-side auth)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize network errors to a friendlier message
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      error.message =
        "Cannot reach the backend server. Make sure it is running on " +
        API_BASE;
    }
    return Promise.reject(error);
  },
);

export interface JobStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  originalName: string;
  documentType: string;
  uploadedAt: string;
  completedAt?: string | null;
  error?: string | null;
  data?: {
    rawText: string;
    structured: Transaction[];
    summary: DocumentSummary;
    review: {
      duplicateCount: number;
      lowConfidenceCount: number;
    };
    auditLog: AuditLogEntry[];
  };
}

export interface Transaction {
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

export interface AuditLogEntry {
  action: "uploaded" | "processed" | "edited";
  at: string;
  by: string | null;
  note?: string;
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
}

export interface HistoryJob {
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

export const uploadDocument = async (
  file: File,
  documentType: string,
): Promise<{ success: boolean; jobId: string; message: string }> => {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("documentType", documentType);

  const response = await api.post("/ocr/process", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const uploadDocumentsBatch = async (
  files: File[],
  documentType: string,
): Promise<{
  success: boolean;
  jobs: Array<{ jobId: string; fileName: string }>;
  message: string;
}> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("documents", file));
  formData.append("documentType", documentType);

  const response = await api.post("/ocr/process-batch", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const getJobStatus = async (
  jobId: string,
): Promise<{ success: boolean; job: JobStatus }> => {
  const response = await api.get(`/ocr/status/${jobId}`);
  return response.data;
};

export const getHistory = async (): Promise<{
  success: boolean;
  jobs: HistoryJob[];
}> => {
  const response = await api.get("/ocr/history");
  return response.data;
};

export const getDownloadUrl = (
  jobId: string,
  format: "xlsx" | "csv" = "xlsx",
): string => `${API_BASE}/ocr/download/${jobId}?format=${format}`;

export const getDocumentPreviewUrl = (jobId: string): string =>
  `${API_BASE}/ocr/document/${jobId}`;

export const updateReviewedRows = async (
  jobId: string,
  rows: Array<{
    rowIndex: number;
    date?: string;
    description?: string;
    debit?: number | null;
    credit?: number | null;
    balance?: number | null;
  }>,
): Promise<{ success: boolean; job: JobStatus }> => {
  const response = await api.put(`/ocr/review/${jobId}`, { rows });
  return response.data;
};
