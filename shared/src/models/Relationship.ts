import type { EvidenceRef } from "./EvidenceRef.js";

export type RelationshipType =
  | "parent_of"
  | "child_of"
  | "partner_of"
  | "carer_of"
  | "sibling_of"
  | "emergency_contact_for"
  | "authorised_pickup_for"
  | "other";

/**
 * Directional link between two people.
 *
 * Example: fromPersonId=parent, toPersonId=child, relationshipType="parent_of".
 */
export interface Relationship {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;
  inverseRelationshipType?: RelationshipType | (string & {});
  startDate?: string;
  endDate?: string;
  evidenceRefs?: EvidenceRef[];
  createdAt?: string;
  updatedAt?: string;
}
