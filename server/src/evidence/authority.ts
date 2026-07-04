import type { EvidenceSourceType } from "@gov-form-copilot/shared";

const SOURCE_AUTHORITY: Record<EvidenceSourceType, number> = {
  birth_certificate: 1.0,
  passport: 0.95,
  medicare: 0.85,
  immunisation: 0.85,
  utility_bill: 0.8,
  parent_declaration: 0.65,
  unknown: 0.4
};

export function authorityFor(sourceType: EvidenceSourceType): number {
  return SOURCE_AUTHORITY[sourceType] ?? SOURCE_AUTHORITY.unknown;
}

export function scoreEvidence(confidence: number, sourceType: EvidenceSourceType): number {
  return confidence * authorityFor(sourceType);
}
