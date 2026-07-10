import type { EvidenceRef } from "./EvidenceRef.js";

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

/**
 * A single extracted document and its raw evidence-backed values.
 *
 * These paths describe extracted data, not necessarily the final canonical
 * domain model.
 */
export interface EvidenceDocument {
  id: string;
  type: EvidenceSourceType;
  label: string;
  extractedAt?: string;
  uploadedAt?: string;
  values: Record<string, EvidenceValue>;
}

/**
 * Canonical evidence-backed value used throughout the identity graph.
 *
 * Facts retain provenance at attribute level so different values on the same
 * person or address can be verified, reviewed and explained independently.
 */
export interface Fact<T = string> {
  value?: T;
  confidence: number;
  status: EvidenceStatus;
  evidenceRefs: EvidenceRef[];
  conflicts?: FactConflict<T>[];
  reason?: string;
}

export interface FactConflict<T = string> {
  value: T;
  confidence?: number;
  evidenceRefs: EvidenceRef[];
  reason?: string;
}

/**
 * Legacy form-shaped field used by CanonicalProfile.
 *
 * Keep this during the v0.6 migration. It mirrors Fact<T>, but embeds the
 * original EvidenceValue objects because the current API and web application
 * still depend on them.
 */
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