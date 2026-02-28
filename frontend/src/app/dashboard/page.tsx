"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Upload,
  RefreshCw,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  Calendar,
} from "lucide-react";
import { getHistory, HistoryJob } from "@/lib/api";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<HistoryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "completed" | "processing" | "failed"
  >("all");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const result = await getHistory();
      setJobs(result.jobs || []);
      setError(null);
    } catch {
      setError(
        "Failed to fetch processing history. Make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "all") return true;
    if (activeTab === "processing")
      return job.status === "processing" || job.status === "pending";
    return job.status === activeTab;
  });

  const completedJobs = jobs.filter((j) => j.status === "completed");
  const totalTransactions = completedJobs.reduce(
    (sum, j) => sum + (j.transactionCount || 0),
    0,
  );
  const pagesUsed = jobs.length;
  const pagesLimit = 50; // Free tier

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "processing":
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-amber-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-neutral-400" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "processing":
        return "Processing";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700";
      case "processing":
      case "pending":
        return "bg-amber-50 text-amber-700";
      case "failed":
        return "bg-red-50 text-red-700";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelative = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      {/* Top bar with user info */}
      <div className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-neutral-600">
                {session?.user?.name?.[0] || "U"}
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold">
                Welcome back
                {session?.user?.name ? `, ${session.user.name}` : ""}
              </h1>
              <p className="text-sm text-neutral-500">
                {session?.user?.email || "Manage your documents"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchJobs}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Usage & Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Usage meter */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500">Pages Used</p>
              <FileText className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="mt-2 text-2xl font-bold">
              {pagesUsed}{" "}
              <span className="text-sm font-normal text-neutral-400">
                / {pagesLimit}
              </span>
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-black transition-all"
                style={{
                  width: `${Math.min((pagesUsed / pagesLimit) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              {pagesLimit - pagesUsed > 0
                ? `${pagesLimit - pagesUsed} free pages remaining`
                : "Free pages used up"}
            </p>
          </div>

          {/* Completed */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500">Processed</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {completedJobs.length}
            </p>
            <p className="mt-1 text-xs text-neutral-400">documents completed</p>
          </div>

          {/* Transactions */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500">
                Transactions Found
              </p>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {totalTransactions}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              across all documents
            </p>
          </div>

          {/* Plan */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500">
                Current Plan
              </p>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">Free</p>
            <Link
              href="/pricing"
              className="mt-1 flex items-center gap-1 text-xs font-medium text-black hover:underline"
            >
              Upgrade plan <TrendingUp className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-2 border-b border-[var(--color-border)]">
          {(
            [
              { key: "all", label: "All", count: jobs.length },
              {
                key: "completed",
                label: "Completed",
                count: completedJobs.length,
              },
              {
                key: "processing",
                label: "Processing",
                count: jobs.filter(
                  (j) => j.status === "processing" || j.status === "pending",
                ).length,
              },
              {
                key: "failed",
                label: "Failed",
                count: jobs.filter((j) => j.status === "failed").length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-black text-black"
                  : "border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    activeTab === tab.key
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
            <p className="mt-4 text-sm text-neutral-400">
              Loading documents...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <XCircle className="mx-auto h-8 w-8 text-red-400" />
            <p className="mt-3 text-sm text-red-600">{error}</p>
            <button
              onClick={fetchJobs}
              className="mt-4 text-sm font-medium text-red-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
              <FileText className="h-8 w-8 text-neutral-300" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">
              {activeTab === "all"
                ? "No documents yet"
                : `No ${activeTab} documents`}
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              {activeTab === "all"
                ? "Upload your first document to get started"
                : "Documents will appear here when available"}
            </p>
            {activeTab === "all" && (
              <Link
                href="/upload"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group rounded-xl border border-[var(--color-border)] bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{job.originalName}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatRelative(job.uploadedAt)}
                        </span>
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-500">
                          {job.documentType.replace("_", " ")}
                        </span>
                        {job.transactionCount > 0 && (
                          <span>{job.transactionCount} transactions</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusColor(job.status)}`}
                    >
                      {statusIcon(job.status)}
                      {statusLabel(job.status)}
                    </span>

                    {job.status === "completed" ? (
                      <Link
                        href={`/results?jobId=${job.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-medium text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-neutral-800"
                      >
                        View Results
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : job.status === "processing" ||
                      job.status === "pending" ? (
                      <span className="text-xs text-amber-500">
                        In progress...
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick tip */}
        {!loading && !error && jobs.length > 0 && (
          <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-neutral-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-white">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Pro tip</p>
                <p className="mt-1 text-sm text-neutral-500">
                  For best OCR accuracy, upload high-resolution scans (300 DPI+)
                  with good lighting and contrast. Avoid photos taken at angles.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
