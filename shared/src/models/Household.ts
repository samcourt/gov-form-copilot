import type { EvidenceRef } from "./EvidenceRef.js";

export type HouseholdMemberRole = "adult" | "child" | "dependant" | "other";

export type HouseholdSource =
  | "declared"
  | "imported"
  | "inferred"
  | "application_specific";

export interface HouseholdMember {
  personId: string;
  role: HouseholdMemberRole;
  primaryResident?: boolean;
  evidenceRefs?: EvidenceRef[];
}

/**
 * Contextual grouping of people and addresses.
 *
 * Household membership does not imply a legal or family relationship.
 * Parent, child, partner and carer links belong in Relationship.
 */
export interface Household {
  id: string;
  name?: string;
  source: HouseholdSource;

  members: HouseholdMember[];
  addressIds: string[];

  evidenceRefs?: EvidenceRef[];

  createdAt?: string;
  updatedAt?: string;
}