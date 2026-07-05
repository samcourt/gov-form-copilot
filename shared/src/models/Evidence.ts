export type EvidenceSourceType =
  | "birth_certificate"
  | "utility_bill"
  | "passport"
  | "medicare"
  | "immunisation"
  | "parent_declaration"
  | "unknown";

export type EvidenceStatus =
  | "verified"
  | "needs_review"
  | "conflicted"
  | "unsupported";

export interface EvidenceValue<T = string> {
  value: T;
  sourceId: string;
  sourceType: EvidenceSourceType;
  sourceLabel: string;
  confidence: number;
  extractedAt?: string;
  page?: number;
  field?: string;
  rawText?: string;
}

export interface EvidenceDocument {
  id: string;
  type: EvidenceSourceType;
  label: string;
  extractedAt?: string;
  uploadedAt?: string;
  values: Record<string, EvidenceValue>;
}

export interface ProfileField<T = string> {
  path: string;
  value?: T;
  confidence: number;
  status: EvidenceStatus;
  evidence: EvidenceValue<T>[];
  conflicts: EvidenceValue<T>[];
  reason?: string;
}

export type EvidenceMap = Record<string, EvidenceValue>;
