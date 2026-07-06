/**
 * Lightweight pointer from a domain model value back to evidence.
 *
 * This deliberately references evidence by id/path rather than embedding
 * EvidenceValue objects into Person, Relationship, Household, or Application.
 */
export interface EvidenceRef {
  evidenceId: string;
  fieldPath?: string;
  confidence?: number;
  notes?: string;
}
