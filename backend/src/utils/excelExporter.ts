import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { ExtractedData } from "../types";

const EXPORT_DIR = path.resolve("./src/uploads/exports");

// Ensure export dir exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

export const generateExcel = (data: ExtractedData, jobId: string): string => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Transactions
  const transactionRows = data.structured.map((t, i) => ({
    "S.N.": i + 1,
    Date: t.date,
    Description: t.description,
    "Debit (NPR)": t.debit ?? "",
    "Credit (NPR)": t.credit ?? "",
    "Balance (NPR)": t.balance ?? "",
  }));

  const ws1 = XLSX.utils.json_to_sheet(transactionRows);

  // Set column widths
  ws1["!cols"] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, ws1, "Transactions");

  // Sheet 2: Summary
  const summaryRows = [
    { Field: "Document Type", Value: data.summary.documentType },
    { Field: "Bank Name", Value: data.summary.bankName || "N/A" },
    { Field: "Account Number", Value: data.summary.accountNumber || "N/A" },
    {
      Field: "Total Debit",
      Value: `NPR ${data.summary.totalDebit.toLocaleString()}`,
    },
    {
      Field: "Total Credit",
      Value: `NPR ${data.summary.totalCredit.toLocaleString()}`,
    },
    {
      Field: "Total Transactions",
      Value: data.summary.transactionCount.toString(),
    },
    { Field: "Currency", Value: data.summary.currency },
  ];

  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  ws2["!cols"] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");

  // Sheet 3: Raw Text
  const rawRows = data.rawText.split("\n").map((line, i) => ({
    Line: i + 1,
    Text: line,
  }));
  const ws3 = XLSX.utils.json_to_sheet(rawRows);
  ws3["!cols"] = [{ wch: 8 }, { wch: 100 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Raw OCR Text");

  // Write file
  const fileName = `docuparse_${jobId}.xlsx`;
  const filePath = path.join(EXPORT_DIR, fileName);
  XLSX.writeFile(wb, filePath);

  return fileName;
};
