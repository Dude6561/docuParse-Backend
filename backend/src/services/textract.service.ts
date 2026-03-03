import {
  AnalyzeDocumentCommand,
  Block,
  TextractClient,
} from "@aws-sdk/client-textract";
import { env } from "../config/env.js";

const client = new TextractClient({
  region: env.AWS_REGION,
  ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

export interface TextractResult {
  blocks: Block[];
  rawText: string;
  tableCount: number;
  signatureBlocks: Block[];
  confidenceScore: number;
}

export async function analyzeWithTextract(
  fileBuffer: Buffer,
): Promise<TextractResult> {
  const response = await client.send(
    new AnalyzeDocumentCommand({
      Document: { Bytes: fileBuffer },
      FeatureTypes: ["TABLES", "FORMS", "SIGNATURES", "LAYOUT"],
    }),
  );

  const blocks = response.Blocks ?? [];
  const lines = blocks
    .filter((block) => block.BlockType === "LINE" && block.Text)
    .map((block) => block.Text!.trim());
  const tables = blocks.filter((block) => block.BlockType === "TABLE");
  const signatures = blocks.filter((block) => block.BlockType === "SIGNATURE");
  const confidenceCandidates = blocks
    .map((block) => block.Confidence)
    .filter((value): value is number => typeof value === "number");

  const confidenceScore =
    confidenceCandidates.length > 0
      ? Number(
          (
            confidenceCandidates.reduce((sum, value) => sum + value, 0) /
            confidenceCandidates.length
          ).toFixed(2),
        )
      : 0;

  return {
    blocks,
    rawText: lines.join("\n"),
    tableCount: tables.length,
    signatureBlocks: signatures,
    confidenceScore,
  };
}
