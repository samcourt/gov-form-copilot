import type { EvidenceDocument, EvidenceSourceType, EvidenceValue } from "@gov-form-copilot/shared";
import { makeDocumentId } from "./documentId.js";

export function createEvidenceDocumentFromValues(args: {
  id?: string;
  type: EvidenceSourceType;
  label: string;
  values: Record<string, string>;
  confidence?: number;
  rawText?: string;
}): EvidenceDocument {
  const id = args.id ?? makeDocumentId(args.label);
  const extractedAt = new Date().toISOString();
  const values: Record<string, EvidenceValue> = {};

  for (const [path, value] of Object.entries(args.values)) {
    values[path] = {
      value,
      sourceId: id,
      sourceType: args.type,
      sourceLabel: args.label,
      confidence: args.confidence ?? 0.85,
      extractedAt,
      rawText: args.rawText
    };
  }

  return { id, type: args.type, label: args.label, extractedAt, uploadedAt: extractedAt, values };
}
