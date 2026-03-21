"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileImage,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { uploadDocument, uploadDocumentsBatch } from "@/lib/api";

const documentTypes = [
  { value: "bank_statement", label: "Bank Statement", icon: "🏦" },
  { value: "receipt", label: "Receipt / Invoice", icon: "🧾" },
  { value: "tax_document", label: "Tax Document", icon: "📋" },
  { value: "citizenship", label: "Citizenship / PAN", icon: "🪪" },
  { value: "other", label: "Other Document", icon: "📄" },
];

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState("bank_statement");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndSetFiles(droppedFiles);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFiles(Array.from(e.target.files));
    }
  };

  const validateAndSetFiles = (incomingFiles: File[]) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/tiff",
      "application/pdf",
    ];

    const validFiles: File[] = [];
    for (const f of incomingFiles) {
      if (!allowedTypes.includes(f.type)) {
        setError(
          "Unsupported file type. Please upload JPEG, PNG, WebP, TIFF, or PDF.",
        );
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        setError(`File too large: ${f.name}. Maximum size is 10MB.`);
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length > 0) {
      setFiles(validFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      if (files.length === 1) {
        const result = await uploadDocument(files[0]!, documentType);
        if (result.success && result.jobId) {
          router.push(`/results?jobId=${result.jobId}`);
          return;
        }
        setError(result.message || "Upload failed");
      } else {
        const batchResult = await uploadDocumentsBatch(files, documentType);
        if (batchResult.success && batchResult.jobs.length > 0) {
          router.push(`/results?jobId=${batchResult.jobs[0]!.jobId}`);
          return;
        }
        setError(batchResult.message || "Batch upload failed");
      }
    } catch (err: unknown) {
      const errorObject = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        errorObject.response?.data?.message ||
          errorObject.message ||
          "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
          <p className="mt-3 text-neutral-500">
            Upload a bank statement, receipt, or financial document to extract
            data
          </p>
        </div>

        {/* Document Type Selection */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-medium text-neutral-700">
            Document Type
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {documentTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setDocumentType(type.value)}
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                  documentType === type.value
                    ? "border-black bg-black text-white"
                    : "border-[var(--color-border)] bg-white text-neutral-600 hover:border-neutral-300"
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-all ${
            dragActive
              ? "border-emerald-500 bg-emerald-50"
              : files.length > 0
                ? "border-emerald-300 bg-emerald-50/50"
                : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
          } ${uploading ? "animate-pulse-border" : ""}`}
        >
          {files.length === 0 ? (
            <div>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                <Upload className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-base font-medium text-neutral-700">
                Drag and drop your document here
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                or click to browse • JPEG, PNG, PDF, TIFF, WebP • Max 10MB
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/tiff,application/pdf"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          ) : (
            <div className="space-y-3 text-left">
              {files.map((file) => (
                <div
                  key={file.name + file.size}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                      <FileImage className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-neutral-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-xs text-neutral-500">
                <span>{files.length} file(s) selected</span>
                <button
                  onClick={() => {
                    setFiles([]);
                    setError(null);
                  }}
                  className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-all ${
            files.length > 0 && !uploading
              ? "bg-black text-white hover:bg-neutral-800"
              : "cursor-not-allowed bg-neutral-100 text-neutral-400"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading & Processing {files.length} file(s)...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {files.length > 1 ? "Process Batch" : "Process Document"}
            </>
          )}
        </button>

        {/* Info */}
        <div className="mt-8 rounded-lg border border-[var(--color-border)] bg-neutral-50 p-5">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 text-neutral-400" />
            <div>
              <p className="text-sm font-medium text-neutral-700">
                How it works
              </p>
              <ul className="mt-2 space-y-1 text-xs text-neutral-500">
                <li>1. Upload a scanned document or photo</li>
                <li>2. Our OCR engine extracts all text from the image</li>
                <li>3. Transactions are parsed and structured automatically</li>
                <li>4. Download the results as an Excel spreadsheet</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
