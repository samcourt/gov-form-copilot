import type { EvidenceRef } from "./EvidenceRef.js";

export type RelationshipType =
  | "parent_of"
  | "partner_of"
  | "carer_of"
  | "sibling_of"
  | "emergency_contact_for"
  | "authorised_pickup_for"
  | "other";

/**
 * Directional relationship between two people.
 *
 * Only one canonical direction should be stored. Inverse labels such as
 * child_of should be derived when displaying or querying the graph.
 *
 * Example:
 * fromPersonId = parent
 * toPersonId = child
 * relationshipType = parent_of
 */
export interface Relationship {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;

  startDate?: string;
  endDate?: string;

  evidenceRefs?: EvidenceRef[];

  createdAt?: string;
  updatedAt?: string;
}