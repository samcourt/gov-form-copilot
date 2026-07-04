import type { FieldModel } from "@gov-form-copilot/shared";

export interface FieldMatch {
  profilePath: string;
  matchedTerm: string;
  score: number;
}

const RULES: Array<{ profilePath: string; terms: string[] }> = [
  { profilePath: "student.givenName", terms: ["student given name", "child given name", "applicant given name", "first name", "given name"] },
  { profilePath: "student.familyName", terms: ["student family name", "child family name", "applicant family name", "last name", "surname", "family name"] },
  { profilePath: "student.preferredName", terms: ["preferred name"] },
  { profilePath: "student.dateOfBirth", terms: ["student date of birth", "child date of birth", "date of birth", "dob", "birth date"] },
  { profilePath: "student.gender", terms: ["gender", "sex"] },
  { profilePath: "parent.givenName", terms: ["parent given name", "carer given name", "guardian given name"] },
  { profilePath: "parent.familyName", terms: ["parent family name", "carer family name", "guardian family name"] },
  { profilePath: "parent.email", terms: ["email", "email address"] },
  { profilePath: "parent.mobile", terms: ["mobile", "phone", "telephone", "contact number"] },
  { profilePath: "address.postcode", terms: ["postcode", "postal code", "zip code"] },
  { profilePath: "address.suburb", terms: ["suburb", "town", "city"] },
  { profilePath: "address.state", terms: ["state"] },
  { profilePath: "address.country", terms: ["country"] },
  { profilePath: "address.line1", terms: ["street address", "address line 1", "street number", "street name"] },
  { profilePath: "address.fullAddress", terms: ["residential address", "home address", "full address"] }
];

function normalise(text = ""): string {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function matchField(field: FieldModel): FieldMatch | null {
  const primary = normalise(
    [field.label, field.name, field.fieldId, field.placeholder].filter(Boolean).join(" ")
  );

  const secondary = normalise(
    [field.section, field.helpText, field.fieldType].filter(Boolean).join(" ")
  );

  let best: FieldMatch | null = null;

  for (const rule of RULES) {
    for (const term of rule.terms) {
      const normalisedTerm = normalise(term);
      const score =
        primary.includes(normalisedTerm)
          ? normalisedTerm.split(" ").length * 10
          : secondary.includes(normalisedTerm)
            ? normalisedTerm.split(" ").length
            : 0;
      if (score > 0 && (!best || score > best.score)) {
        best = { profilePath: rule.profilePath, matchedTerm: term, score };
      }
    }
  }

  return best;
}
