import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});
//edit
export interface JobStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  originalName: string;
  documentType: string;
  uploadedAt: string;
  completedAt?: string;
  error?: string;
  data?: {
    rawText: string;
    structured: Transaction[];
    summary: DocumentSummary;
  };
}

export interface Transaction {
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

export interface HistoryJob {
  id: string;
  originalName: string;
  status: string;
  documentType: string;
  uploadedAt: string;
  completedAt?: string;
  transactionCount: number;
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

export const getDownloadUrl = (jobId: string): string =>
  `${API_BASE}/ocr/download/${jobId}`;
