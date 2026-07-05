import type { ProfileField } from "./Evidence.js";

export interface CanonicalProfile {
  student: {
    givenName: ProfileField;
    middleName: ProfileField;
    familyName: ProfileField;
    preferredName: ProfileField;
    dateOfBirth: ProfileField;
    gender: ProfileField;
    countryOfBirth: ProfileField;
    residencyStatus: ProfileField;
    aboriginalOrTorresStraitIslander: ProfileField;
    languageOtherThanEnglishAtHome: ProfileField;
    attendedAnotherSchool: ProfileField;
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

export interface ProfileBuildResult {
  profile: CanonicalProfile;
  documents: number;
  fields: number;
  conflicts: number;
  generatedAt: string;
}
