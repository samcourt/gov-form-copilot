export type EvidenceSourceType = "birth_certificate" | "utility_bill" | "passport" | "medicare" | "immunisation" | "unknown";

export interface EvidenceValue<T = string> {
  value: T;
  sourceId: string;
  sourceType: EvidenceSourceType;
  sourceLabel: string;
  confidence: number;
  extractedAt?: string;
  page?: number;
  rawText?: string;
}

export interface EvidenceDocument {
  id: string;
  type: EvidenceSourceType;
  label: string;
  extractedAt?: string;
  values: Record<string, EvidenceValue>;
}

export interface ProfileField<T = string> {
  value?: T;
  confidence: number;
  evidence: EvidenceValue<T>[];
  conflicts?: EvidenceValue<T>[];
}

export interface CanonicalProfile {
  student: {
    givenName: ProfileField;
    familyName: ProfileField;
    middleName: ProfileField;
    preferredName: ProfileField;
    dateOfBirth: ProfileField;
    gender: ProfileField;
  };
  parent: {
    givenName: ProfileField;
    familyName: ProfileField;
    email: ProfileField;
    mobile: ProfileField;
  };
  address: {
    line1: ProfileField;
    suburb: ProfileField;
    state: ProfileField;
    postcode: ProfileField;
    country: ProfileField;
    fullAddress: ProfileField;
  };
}
