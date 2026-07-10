import type { EvidenceRef } from "./EvidenceRef.js";

export type ApplicationType =
  | "school_enrolment"
  | "preschool_enrolment"
  | "childcare_enrolment"
  | "benefit_application"
  | "other"
  | (string & {});

export type FormRole =
  | "student"
  | "child"
  | "applicant"
  | "parent_1"
  | "parent_2"
  | "carer"
  | "partner"
  | "emergency_contact"
  | "authorised_pickup"
  | "household_member"
  | (string & {});

export type RoleMappingSource =
  | "manual"
  | "migration"
  | "imported"
  | "inferred"
  | "inferred_from_relationship";

export interface FormRoleMapping {
  formRole: FormRole;
  personId: string;
  source: RoleMappingSource;
  confidence?: number;
  notes?: string;
  evidenceRefs?: EvidenceRef[];
}

/**
 * A specific form/application task.
 *
 * This is where generic people become form-specific roles.
 */
export interface ApplicationContext {
  id: string;
  applicationType: ApplicationType;
  householdId?: string;
  subjectPersonId?: string;
  primaryApplicantPersonId?: string;
  roleMappings: FormRoleMapping[];
  evidenceRefs?: EvidenceRef[];
  createdAt?: string;
  updatedAt?: string;
}
