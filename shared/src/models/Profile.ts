import type { ProfileField } from "./Evidence.js";
import type { IdentityGraph } from "./IdentityGraph.js";

/**
 * Legacy, form-shaped profile used by the current UI/API.
 *
 * Keep this during the v0.6 migration so existing profile rendering,
 * suggestion matching, and browser-extension flows do not break.
 *
 * Long term, this should become a derived view over IdentityGraph rather
 * than the source of truth.
 */
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

/**
 * Transitional profile build result.
 *
 * `profile` remains for existing consumers.
 * `identityGraph` is the new graph-shaped source of truth.
 */
export interface ProfileBuildResult {
  profile: CanonicalProfile;
  identityGraph?: IdentityGraph;
  documents: number;
  fields: number;
  conflicts: number;
  generatedAt: string;
}
