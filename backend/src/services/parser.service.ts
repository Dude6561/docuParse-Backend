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
const textMonthDateRegex =
  /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{2,4})/i;
const amountRegex = /-?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/g;
const accountRegex = /(a\/c|account)\s*(number|no)?\s*[:\-]?\s*([0-9]{6,20})/i;
const chequeRegex =
  /(cheque\s*(?:no|number)?|chq\s*(?:no|number)?|chq#|cheque#)\s*[:\-]?\s*([a-z0-9\/-]{4,})/i;
const LOW_CONFIDENCE_THRESHOLD = 80;

const parserProfiles = {
  generic: {
    name: "generic",
    bankAliases: [] as string[],
    datePatterns: [dateRegex, textMonthDateRegex],
  },
  nabil: {
    name: "nabil",
    bankAliases: ["NABIL"],
    datePatterns: [dateRegex, textMonthDateRegex],
  },
  nicAsia: {
    name: "nic_asia",
    bankAliases: ["NIC ASIA"],
    datePatterns: [dateRegex, textMonthDateRegex],
  },
  globalIme: {
    name: "global_ime",
    bankAliases: ["GLOBAL IME"],
    datePatterns: [dateRegex, textMonthDateRegex],
  },
};

type ParserProfile = (typeof parserProfiles)[keyof typeof parserProfiles];

function parseAmount(value: string): number | null {
  const normalized = value.replace(/,/g, "").trim();
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function toTimestamp(dateText: string): number | null {
  const numeric = dateText.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]);
    const yearRaw = Number(numeric[3]);
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
    const dt = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(dt.getTime()) ? null : dt.getTime();
  }

  const parsed = Date.parse(dateText);
  return Number.isNaN(parsed) ? null : parsed;
}

function countBalanceContinuityIssues(rows: TransactionRow[]) {
  const rowsWithBalance = rows.filter((row) => typeof row.balance === "number");
  if (rowsWithBalance.length < 2) {
    return 0;
  }

  let mismatchesAscending = 0;
  let mismatchesDescending = 0;

  for (let index = 1; index < rowsWithBalance.length; index += 1) {
    const previous = rowsWithBalance[index - 1]!;
    const current = rowsWithBalance[index]!;

    const expectedAscending =
      (previous.balance ?? 0) + (current.credit ?? 0) - (current.debit ?? 0);
    const expectedDescending =
      (previous.balance ?? 0) - (current.credit ?? 0) + (current.debit ?? 0);

    if (Math.abs((current.balance ?? 0) - expectedAscending) > 0.01) {
      mismatchesAscending += 1;
    }
    if (Math.abs((current.balance ?? 0) - expectedDescending) > 0.01) {
      mismatchesDescending += 1;
    }
  }

  return Math.min(mismatchesAscending, mismatchesDescending);
}

function detectBankName(text: string) {
  const upper = text.toUpperCase();
  return knownBanks.find((name) => upper.includes(name));
}

function detectAccount(text: string) {
  const matched = text.match(accountRegex);
  return matched?.[3];
}

function detectParserProfile(text: string): ParserProfile {
  const upper = text.toUpperCase();
  const preferredProfiles = [
    parserProfiles.nabil,
    parserProfiles.nicAsia,
    parserProfiles.globalIme,
  ];

  for (const profile of preferredProfiles) {
    if (profile.bankAliases.some((alias) => upper.includes(alias))) {
      return profile;
    }
  }

  return parserProfiles.generic;
}

export function extractChequeReference(text: string): string | null {
  const match = text.match(chequeRegex);
  if (!match) {
    return null;
  }

  return match[2]?.toUpperCase() ?? null;
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
  const profile = detectParserProfile(lines.map((line) => line.text).join(" "));

  for (const line of lines) {
    const dateMatch = profile.datePatterns
      .map((pattern) => line.text.match(pattern))
      .find((match) => Boolean(match));
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
      chequeRef: extractChequeReference(line.text),
      debit,
      credit,
      balance,
    };

    if (typeof line.confidence === "number") {
      transaction.confidence = line.confidence;
      transaction.lowConfidence = line.confidence < LOW_CONFIDENCE_THRESHOLD;
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

  const profile = detectParserProfile(params.rawText);
  summary.parserProfile = profile.name;

  const duplicateKeyCounts = new Map<string, number>();
  params.transactionRows.forEach((row) => {
    const key = [
      row.date,
      row.description.trim().toLowerCase(),
      row.debit ?? "",
      row.credit ?? "",
      row.balance ?? "",
    ].join("|");
    duplicateKeyCounts.set(key, (duplicateKeyCounts.get(key) ?? 0) + 1);
  });

  summary.duplicateCount = Array.from(duplicateKeyCounts.values()).reduce(
    (sum, count) => sum + (count > 1 ? count : 0),
    0,
  );
  summary.lowConfidenceCount = params.transactionRows.filter(
    (row) => row.lowConfidence,
  ).length;
  summary.balanceContinuityIssues = countBalanceContinuityIssues(
    params.transactionRows,
  );
  summary.invalidDateCount = params.transactionRows.filter(
    (row) => toTimestamp(row.date) === null,
  ).length;

  if (params.confidenceScore >= 90) {
    summary.scanQuality = "good";
  } else if (params.confidenceScore >= 75) {
    summary.scanQuality = "fair";
  } else {
    summary.scanQuality = "poor";
  }

  const rowsWithBalance = params.transactionRows.filter(
    (row) => typeof row.balance === "number",
  );

  if (rowsWithBalance.length > 0) {
    const first = rowsWithBalance[0]!;
    const last = rowsWithBalance[rowsWithBalance.length - 1]!;
    const openingBalance =
      (first.balance ?? 0) - (first.credit ?? 0) + (first.debit ?? 0);
    const closingBalance = last.balance ?? null;
    const calculatedClosingBalance = Number(
      (openingBalance + totalCredit - totalDebit).toFixed(2),
    );

    if (closingBalance !== null) {
      const balanceDifference = Number(
        (closingBalance - calculatedClosingBalance).toFixed(2),
      );

      summary.openingBalance = Number(openingBalance.toFixed(2));
      summary.closingBalance = Number(closingBalance.toFixed(2));
      summary.calculatedClosingBalance = calculatedClosingBalance;
      summary.balanceDifference = balanceDifference;
      summary.balanceCheckPassed = Math.abs(balanceDifference) < 0.01;
    }
  }

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
