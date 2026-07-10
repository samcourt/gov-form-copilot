import type { Fact } from "./Evidence.js";
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
  value: Fact<string>;
  issuer?: Fact<string>;
}

export type ContactMethodType =
  | "email"
  | "mobile"
  | "phone"
  | "work_phone"
  | "other";

export interface ContactMethod {
  id: string;
  type: ContactMethodType;
  value: Fact<string>;
  primary?: boolean;
}

export interface PersonLegalName {
  givenName: Fact<string>;
  middleName?: Fact<string>;
  familyName: Fact<string>;
  fullName?: Fact<string>;
}

export interface PersonName {
  legal: PersonLegalName;
  preferredName?: Fact<string>;
}

export interface PersonDemographics {
  dateOfBirth?: Fact<string>;
  gender?: Fact<string>;
  countryOfBirth?: Fact<string>;
}

export interface PersonAddressRef {
  addressId: string;
  type?: "residential" | "postal" | "previous" | "other";
  primary?: boolean;

  /**
   * Evidence supporting the structural link between this person and address.
   *
   * Attribute-level address evidence remains on the Address facts themselves.
   */
  evidenceRefs?: EvidenceRef[];
}

/**
 * Canonical person identity.
 *
 * Form-specific roles such as student, parent, carer and applicant belong in
 * ApplicationContext.roleMappings rather than on Person.
 */
export interface Person {
  id: string;

  /**
   * Human-readable label for navigation and display.
   *
   * This is derived from canonical name facts and is not itself authoritative.
   */
  displayName: string;

  name: PersonName;
  demographics?: PersonDemographics;

  identifiers?: PersonIdentifier[];
  contacts?: ContactMethod[];
  addresses?: PersonAddressRef[];

  /**
   * Evidence supporting the existence or overall identity of the person.
   *
   * Evidence supporting individual attributes belongs on each Fact<T>.
   */
  evidenceRefs?: EvidenceRef[];

  createdAt?: string;
  updatedAt?: string;
}