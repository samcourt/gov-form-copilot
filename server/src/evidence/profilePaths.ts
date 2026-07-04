export const PROFILE_PATHS = [
  "student.givenName",
  "student.middleName",
  "student.familyName",
  "student.preferredName",
  "student.dateOfBirth",
  "student.gender",
  "student.countryOfBirth",
  "student.residencyStatus",
  "student.aboriginalOrTorresStraitIslander",
  "student.languageOtherThanEnglishAtHome",
  "student.attendedAnotherSchool",
  "parent.givenName",
  "parent.familyName",
  "parent.email",
  "parent.mobile",
  "address.line1",
  "address.suburb",
  "address.state",
  "address.postcode",
  "address.country",
  "address.fullAddress"
] as const;

export type ProfilePath = (typeof PROFILE_PATHS)[number];
