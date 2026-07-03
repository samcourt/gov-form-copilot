import type { PageField } from "@gov-form-copilot/shared";

interface Rule {
  path: string;
  terms: string[];
}

export interface FieldMatch extends Rule {
  matchedTerm: string;
  score: number;
}

const RULES: Rule[] = [
  { path: "student.givenName", terms: ["student given name", "child given name", "applicant given name", "first name", "given name"] },
  { path: "student.familyName", terms: ["student family name", "child family name", "applicant family name", "last name", "surname", "family name"] },
  { path: "student.preferredName", terms: ["preferred name"] },
  { path: "student.dateOfBirth", terms: ["student date of birth", "child date of birth", "date of birth", "dob", "birth date"] },
  { path: "student.gender", terms: ["student gender", "child gender", "gender", "sex"] },
  { path: "parent.givenName", terms: ["parent given name", "carer given name", "guardian given name"] },
  { path: "parent.familyName", terms: ["parent family name", "carer family name", "guardian family name"] },
  { path: "parent.email", terms: ["parent email", "carer email", "email", "email address"] },
  { path: "parent.mobile", terms: ["parent mobile", "carer mobile", "mobile", "phone", "telephone", "contact number"] },
  { path: "address.line1", terms: ["address line 1", "residential address", "street address", "home address"] },
  { path: "address.suburb", terms: ["suburb", "town"] },
  { path: "address.state", terms: ["state"] },
  { path: "address.postcode", terms: ["postcode", "postal code"] },
  { path: "address.country", terms: ["country"] }
];

function normalise(text = ""): string {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function matchField(field: PageField): FieldMatch | null {
  const haystack = normalise(`${field.section ?? ""} ${field.label ?? ""} ${field.name ?? ""} ${field.fieldId ?? ""}`);

  let best: FieldMatch | null = null;

  for (const rule of RULES) {
    for (const term of rule.terms) {
      const normalisedTerm = normalise(term);
      const score = haystack.includes(normalisedTerm) ? normalisedTerm.split(" ").length : 0;

      if (score > 0 && (!best || score > best.score)) {
        best = { ...rule, matchedTerm: term, score };
      }
    }
  }

  return best;
}
