import type { EvidenceSourceType } from "@gov-form-copilot/shared";

export interface ExtractTextRequest {
  sourceType: EvidenceSourceType;
  label: string;
  rawText: string;
}

export interface StructuredEvidenceRequest {
  id?: string;
  sourceType: EvidenceSourceType;
  label: string;
  values: Record<string, string>;
}
