"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  FileText,
  Building2,
  CreditCard,
  Clock,
  RefreshCw,
} from "lucide-react";
import { getJobStatus, getDownloadUrl, JobStatus } from "@/lib/api";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-16">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      const result = await getJobStatus(jobId);
      setJob(result.job);
      setError(null);

      // Auto-poll if still processing
      if (
        result.job.status === "pending" ||
        result.job.status === "processing"
      ) {
        setTimeout(fetchStatus, 2000);
      }
    } catch {
      setError("Failed to fetch job status.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (!jobId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-10 w-10 text-neutral-300" />
          <p className="mt-4 text-neutral-500">No job ID provided</p>
          <Link
            href="/upload"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-black hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Upload a document
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-300" />
          <p className="mt-4 text-sm text-neutral-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-10 w-10 text-red-400" />
          <p className="mt-4 text-red-500">{error || "Job not found"}</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-black hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isProcessing = job.status === "pending" || job.status === "processing";
  const isCompleted = job.status === "completed";
  const isFailed = job.status === "failed";

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-6">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {job.originalName}
              </h1>
              {isProcessing && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                  <Loader2 className="h-3 w-3 animate-spin" /> Processing
                </span>
              )}
              {isCompleted && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </span>
              )}
              {isFailed && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  <XCircle className="h-3 w-3" /> Failed
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-400">Job ID: {job.id}</p>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-2">
              <a
                href={getDownloadUrl(jobId, "xlsx")}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Excel
              </a>
              <a
                href={getDownloadUrl(jobId, "csv")}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </a>
            </div>
          )}

          {isProcessing && (
            <button
              onClick={fetchStatus}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          )}
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 p-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-400" />
            <h3 className="mt-4 text-lg font-semibold text-amber-700">
              Processing your document...
            </h3>
            <p className="mt-2 text-sm text-amber-500">
              Our OCR engine is extracting text and parsing transactions. This
              usually takes 10-30 seconds.
            </p>
          </div>
        )}

        {/* Failed State */}
        {isFailed && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <XCircle className="mx-auto h-10 w-10 text-red-400" />
            <h3 className="mt-4 text-lg font-semibold text-red-700">
              Processing Failed
            </h3>
            <p className="mt-2 text-sm text-red-500">
              {job.error || "An error occurred while processing your document."}
            </p>
            <Link
              href="/upload"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </Link>
          </div>
        )}

        {/* Completed: Show Results */}
        {isCompleted && job.data && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <SummaryCard
                icon={<Building2 className="h-5 w-5" />}
                label="Bank"
                value={job.data.summary.bankName || "Unknown"}
              />
              <SummaryCard
                icon={<CreditCard className="h-5 w-5" />}
                label="Account"
                value={job.data.summary.accountNumber || "N/A"}
              />
              <SummaryCard
                icon={<FileSpreadsheet className="h-5 w-5" />}
                label="Transactions"
                value={job.data.summary.transactionCount.toString()}
              />
              <SummaryCard
                icon={<Clock className="h-5 w-5" />}
                label="Processed"
                value={
                  job.completedAt
                    ? new Date(job.completedAt).toLocaleTimeString()
                    : "—"
                }
              />
              <SummaryCard
                icon={<FileText className="h-5 w-5" />}
                label="Confidence"
                value={`${job.data.summary.confidenceScore.toFixed(1)}%`}
              />
              <SummaryCard
                icon={<FileText className="h-5 w-5" />}
                label="Tables"
                value={job.data.summary.tablesDetected.toString()}
              />
              <SummaryCard
                icon={<FileText className="h-5 w-5" />}
                label="Signatures"
                value={job.data.summary.signaturesDetected.toString()}
              />
            </div>

            {/* Financials */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Total Debit
                </p>
                <p className="mt-2 text-2xl font-bold text-red-500">
                  NPR {job.data.summary.totalDebit.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Total Credit
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-500">
                  NPR {job.data.summary.totalCredit.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Transactions Table */}
            {job.data.structured.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                <div className="border-b border-[var(--color-border)] bg-neutral-50 px-4 py-3">
                  <h3 className="text-sm font-semibold">
                    Extracted Transactions ({job.data.structured.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-neutral-50/50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">
                          Description
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500">
                          Debit (NPR)
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500">
                          Credit (NPR)
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500">
                          Balance (NPR)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.data.structured.map((tx, i) => (
                        <tr
                          key={i}
                          className="border-b border-[var(--color-border)] last:border-0 hover:bg-neutral-50"
                        >
                          <td className="px-4 py-2 text-neutral-400">
                            {i + 1}
                          </td>
                          <td className="px-4 py-2 font-mono text-xs">
                            {tx.date}
                          </td>
                          <td className="px-4 py-2 max-w-[200px] truncate">
                            {tx.description}
                          </td>
                          <td className="px-4 py-2 text-right text-red-500">
                            {tx.debit ? tx.debit.toLocaleString() : "—"}
                          </td>
                          <td className="px-4 py-2 text-right text-emerald-500">
                            {tx.credit ? tx.credit.toLocaleString() : "—"}
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {tx.balance ? tx.balance.toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Raw OCR Text */}
            <div className="rounded-xl border border-[var(--color-border)]">
              <div className="border-b border-[var(--color-border)] bg-neutral-50 px-4 py-3">
                <h3 className="text-sm font-semibold">Raw OCR Text</h3>
              </div>
              <div className="max-h-64 overflow-y-auto p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-500">
                  {job.data.rawText || "No text extracted."}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
      <div className="flex items-center gap-2 text-neutral-400">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-2 text-lg font-semibold truncate">{value}</p>
    </div>
  );
}
