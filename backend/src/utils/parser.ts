import { ParsedTransaction, DocumentSummary, ExtractedData } from "../types";

/**
 * Parse raw OCR text into structured bank statement data.
 * Handles common Nepali bank statement formats (NIC Asia, Nabil, NMB, Himalayan, etc.)
 */
export const parseStatement = (
  rawText: string,
  docType: string,
): ExtractedData => {
  const lines = rawText.split("\n").filter((l) => l.trim().length > 0);
  const transactions: ParsedTransaction[] = [];

  // Extract bank name from header
  const bankName = detectBankName(rawText);

  // Extract account number
  const accountNumber = extractAccountNumber(rawText);

  // Parse transaction lines
  // Common patterns: Date | Description | Debit | Credit | Balance
  const datePattern =
    /(\d{4}[-/.]\d{2}[-/.]\d{2}|\d{2}[-/.]\d{2}[-/.]\d{4}|\d{2,4}[-/.]\d{2}[-/.]\d{2,4})/;
  const amountPattern = /[\d,]+\.?\d{0,2}/g;

  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;

    const date = dateMatch[1];
    const afterDate = line.substring(line.indexOf(date) + date.length).trim();

    // Extract amounts from the line
    const amounts = afterDate.match(amountPattern) || [];
    const numericAmounts = amounts
      .map((a) => parseFloat(a.replace(/,/g, "")))
      .filter((a) => !isNaN(a) && a > 0);

    // Try to extract description (text between date and first number)
    const descMatch = afterDate.match(/^([a-zA-Z\s/.&\-]+)/);
    const description = descMatch ? descMatch[1].trim() : "Transaction";

    let debit: number | null = null;
    let credit: number | null = null;
    let balance: number | null = null;

    if (numericAmounts.length >= 3) {
      debit = numericAmounts[0] || null;
      credit = numericAmounts[1] || null;
      balance = numericAmounts[2];
    } else if (numericAmounts.length === 2) {
      // Could be debit+balance or credit+balance
      if (
        line.toLowerCase().includes("cr") ||
        line.toLowerCase().includes("deposit")
      ) {
        credit = numericAmounts[0];
      } else {
        debit = numericAmounts[0];
      }
      balance = numericAmounts[1];
    } else if (numericAmounts.length === 1) {
      balance = numericAmounts[0];
    }

    if (date && (debit || credit || balance)) {
      transactions.push({ date, description, debit, credit, balance });
    }
  }

  const totalDebit = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalCredit = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);

  const summary: DocumentSummary = {
    documentType: docType,
    bankName: bankName || "Unknown Bank",
    accountNumber: accountNumber || "N/A",
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    transactionCount: transactions.length,
    currency: "NPR",
  };

  return { rawText, structured: transactions, summary };
};

const detectBankName = (text: string): string | undefined => {
  const banks = [
    { pattern: /nic\s*asia/i, name: "NIC Asia Bank" },
    { pattern: /nabil/i, name: "Nabil Bank" },
    { pattern: /nmb/i, name: "NMB Bank" },
    { pattern: /himalayan/i, name: "Himalayan Bank" },
    { pattern: /nepal\s*investment/i, name: "Nepal Investment Bank" },
    { pattern: /global\s*ime/i, name: "Global IME Bank" },
    { pattern: /kumari/i, name: "Kumari Bank" },
    { pattern: /mega/i, name: "Mega Bank" },
    { pattern: /sanima/i, name: "Sanima Bank" },
    { pattern: /citizens/i, name: "Citizens Bank" },
    { pattern: /prime\s*commercial/i, name: "Prime Commercial Bank" },
    { pattern: /sunrise/i, name: "Sunrise Bank" },
    { pattern: /machhapuchchhre|machapuchare/i, name: "Machhapuchchhre Bank" },
    { pattern: /laxmi/i, name: "Laxmi Sunrise Bank" },
    { pattern: /siddhartha/i, name: "Siddhartha Bank" },
    { pattern: /everest/i, name: "Everest Bank" },
    { pattern: /standard\s*chartered/i, name: "Standard Chartered Nepal" },
    { pattern: /rastriya\s*banijya/i, name: "Rastriya Banijya Bank" },
    { pattern: /nepal\s*bank/i, name: "Nepal Bank Limited" },
    { pattern: /agriculture\s*dev/i, name: "Agriculture Development Bank" },
  ];

  for (const bank of banks) {
    if (bank.pattern.test(text)) return bank.name;
  }
  return undefined;
};

const extractAccountNumber = (text: string): string | undefined => {
  // Common patterns for Nepali bank account numbers
  const patterns = [
    /account\s*(?:no|number|#)?[:\s]*([0-9\-]{8,20})/i,
    /a\/c\s*(?:no|number|#)?[:\s]*([0-9\-]{8,20})/i,
    /acct[:\s]*([0-9\-]{8,20})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return undefined;
};
