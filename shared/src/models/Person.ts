import type { EvidenceRef } from "./EvidenceRef.js";

export type PersonIdentifierType =
  | "srn"
  | "medicare"
  | "passport"
  | "birth_certificate"
  | "drivers_licence"
  | "other";

export interface PersonIdentifier {
  type: PersonIdentifierType | (string & {});
  value: string;
  issuer?: string;
  evidenceRefs?: EvidenceRef[];
}

export type ContactMethodType =
  | "email"
  | "mobile"
  | "phone"
  | "work_phone"
  | "other";

export interface ContactMethod {
  type: ContactMethodType;
  value: string;
  primary?: boolean;
  evidenceRefs?: EvidenceRef[];
}

export interface PersonLegalName {
  givenName?: string;
  middleName?: string;
  familyName?: string;
  fullName?: string;
}

export interface PersonAddressRef {
  addressId: string;
  type?: "residential" | "postal" | "previous" | "other";
  primary?: boolean;
  evidenceRefs?: EvidenceRef[];
}

/**
 * Canonical person identity.
 *
 * A Person is independent of a particular form. Form-specific roles like
 * "student", "parent", "carer", and "applicant" are represented through
 * ApplicationContext.roleMappings, not as separate hard-coded profile fields.
 */
export interface Person {
  id: string;
  displayName: string;
  legalName?: PersonLegalName;
  preferredName?: string;
  dateOfBirth?: string;
  gender?: string;
  identifiers?: PersonIdentifier[];
  contacts?: ContactMethod[];
  addresses?: PersonAddressRef[];
  evidenceRefs?: EvidenceRef[];
  createdAt?: string;
  updatedAt?: string;
}
