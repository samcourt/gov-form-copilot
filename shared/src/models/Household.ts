import type { EvidenceRef } from "./EvidenceRef.js";

export type HouseholdMemberRole = "adult" | "child" | "dependant" | "other";

export interface HouseholdMember {
  personId: string;
  role: HouseholdMemberRole;
  primaryResident?: boolean;
  evidenceRefs?: EvidenceRef[];
}

/**
 * Household groups people and addresses for an application context.
 *
 * Household membership is not the same as a legal relationship. Parent/child,
 * carer, partner, and emergency contact relationships belong in Relationship.
 */
export interface Household {
  id: string;
  name?: string;
  members: HouseholdMember[];
  addressIds: string[];
  evidenceRefs?: EvidenceRef[];
  createdAt?: string;
  updatedAt?: string;
}
