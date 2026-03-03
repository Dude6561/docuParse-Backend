import ExcelJS from "exceljs";
import type { DocumentSummary, TransactionRow } from "../types/index.js";

export async function buildExcelBuffer(params: {
  originalName: string;
  summary: DocumentSummary;
  transactions: TransactionRow[];
  rawText: string;
}) {
  const workbook = new ExcelJS.Workbook();

  const txSheet = workbook.addWorksheet("Transactions");
  txSheet.columns = [
    { header: "Date", key: "date", width: 18 },
    { header: "Description", key: "description", width: 45 },
    { header: "Debit", key: "debit", width: 16 },
    { header: "Credit", key: "credit", width: 16 },
    { header: "Balance", key: "balance", width: 16 },
    { header: "Confidence", key: "confidence", width: 14 },
  ];

  params.transactions.forEach((row) => {
    txSheet.addRow({
      ...row,
      confidence: row.confidence ? `${row.confidence.toFixed(2)}%` : null,
    });
  });

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.addRows([
    ["Document", params.originalName],
    ["Document Type", params.summary.documentType],
    ["Bank", params.summary.bankName ?? ""],
    ["Account Number", params.summary.accountNumber ?? ""],
    ["Total Debit", params.summary.totalDebit],
    ["Total Credit", params.summary.totalCredit],
    ["Transactions", params.summary.transactionCount],
    ["Currency", params.summary.currency],
    ["OCR Confidence", `${params.summary.confidenceScore.toFixed(2)}%`],
    ["Signatures Detected", params.summary.signaturesDetected],
    ["Tables Detected", params.summary.tablesDetected],
  ]);

  const rawSheet = workbook.addWorksheet("Raw OCR Text");
  rawSheet.columns = [{ header: "Text", key: "text", width: 120 }];
  params.rawText.split("\n").forEach((line) => {
    rawSheet.addRow({ text: line });
  });

  return workbook.xlsx.writeBuffer();
}

export function buildCsvString(rows: TransactionRow[]) {
  const header = [
    "date",
    "description",
    "debit",
    "credit",
    "balance",
    "confidence",
  ].join(",");
  const lines = rows.map((row) => {
    const escapedDescription = `"${row.description.replace(/"/g, '""')}"`;
    return [
      row.date,
      escapedDescription,
      row.debit ?? "",
      row.credit ?? "",
      row.balance ?? "",
      row.confidence?.toFixed(2) ?? "",
    ].join(",");
  });
  return [header, ...lines].join("\n");
}
