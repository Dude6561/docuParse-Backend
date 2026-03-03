import type { Block } from "@aws-sdk/client-textract";
import type { DocumentSummary, TransactionRow } from "../types/index.js";

const knownBanks = [
  "NIC ASIA",
  "NABIL",
  "GLOBAL IME",
  "NMB",
  "HIMALAYAN",
  "KUMARI",
  "SANIMA",
  "SIDDHARTHA",
  "EVEREST",
  "MACHHAPUCHCHHRE",
];

const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
const amountRegex = /-?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/g;
const accountRegex = /(a\/c|account)\s*(number|no)?\s*[:\-]?\s*([0-9]{6,20})/i;

function parseAmount(value: string): number | null {
  const normalized = value.replace(/,/g, "").trim();
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function detectBankName(text: string) {
  const upper = text.toUpperCase();
  return knownBanks.find((name) => upper.includes(name));
}

function detectAccount(text: string) {
  const matched = text.match(accountRegex);
  return matched?.[3];
}

export function parseTransactionsFromTextract(
  blocks: Block[],
): TransactionRow[] {
  const lines = blocks
    .filter((block) => block.BlockType === "LINE" && block.Text)
    .map((block) => ({
      text: block.Text!.trim(),
      confidence: block.Confidence,
    }));

  const transactions: TransactionRow[] = [];

  for (const line of lines) {
    const dateMatch = line.text.match(dateRegex);
    if (!dateMatch) {
      continue;
    }

    const amounts = line.text.match(amountRegex) ?? [];
    const parsed = amounts
      .map(parseAmount)
      .filter((value): value is number => typeof value === "number");

    if (parsed.length < 1) {
      continue;
    }

    let debit: number | null = null;
    let credit: number | null = null;
    let balance: number | null = null;

    if (parsed.length === 1) {
      balance = parsed[0] ?? null;
    } else if (parsed.length === 2) {
      debit = parsed[0] ?? null;
      balance = parsed[1] ?? null;
    } else {
      debit = parsed[0] ?? null;
      credit = parsed[1] ?? null;
      balance = parsed[2] ?? null;
    }

    const description = line.text
      .replace(dateMatch[0], "")
      .replace(amountRegex, "")
      .replace(/\s+/g, " ")
      .trim();

    const transaction: TransactionRow = {
      date: dateMatch[0],
      description: description.length > 0 ? description : "Transaction",
      debit,
      credit,
      balance,
    };

    if (typeof line.confidence === "number") {
      transaction.confidence = line.confidence;
    }

    transactions.push(transaction);
  }

  return transactions;
}

export function buildSummary(params: {
  rawText: string;
  documentType: string;
  transactionRows: TransactionRow[];
  confidenceScore: number;
  signaturesDetected: number;
  tablesDetected: number;
}): DocumentSummary {
  const totalDebit = params.transactionRows.reduce(
    (sum, row) => sum + (row.debit ?? 0),
    0,
  );
  const totalCredit = params.transactionRows.reduce(
    (sum, row) => sum + (row.credit ?? 0),
    0,
  );

  const summary: DocumentSummary = {
    documentType: params.documentType,
    totalDebit: Number(totalDebit.toFixed(2)),
    totalCredit: Number(totalCredit.toFixed(2)),
    transactionCount: params.transactionRows.length,
    currency: "NPR",
    confidenceScore: params.confidenceScore,
    signaturesDetected: params.signaturesDetected,
    tablesDetected: params.tablesDetected,
  };

  const bankName = detectBankName(params.rawText);
  const accountNumber = detectAccount(params.rawText);

  if (bankName) {
    summary.bankName = bankName;
  }
  if (accountNumber) {
    summary.accountNumber = accountNumber;
  }

  return summary;
}
