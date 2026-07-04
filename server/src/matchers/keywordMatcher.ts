import type { Matcher, MatchResult } from "./types.js";

interface Rule {
  profilePath: string;
  terms: string[];
  secondaryTerms?: string[];
  blockWhen?: string[];
}

const rules: Rule[] = [
  { profilePath: "student.givenName", terms: ["student given name", "student first name", "child given name", "child first name", "applicant given name", "given name", "first name"] },
  { profilePath: "student.middleName", terms: ["student middle name", "child middle name", "middle name"] },
  { profilePath: "student.familyName", terms: ["student family name", "student surname", "child family name", "child surname", "applicant family name", "family name", "surname", "last name"] },
  { profilePath: "student.preferredName", terms: ["preferred name"] },
  {
    profilePath: "student.dateOfBirth",
    terms: ["student date of birth day", "student date of birth month", "student date of birth year", "student date of birth", "child date of birth", "date of birth", "dob", "birth date"],
    blockWhen: ["intended start date", "start date", "commencement date"]
  },
  { profilePath: "student.gender", terms: ["student gender", "gender", "sex"] },
  { profilePath: "student.countryOfBirth", terms: ["student country of birth", "country of birth", "birth country", "born in country"] },
  { profilePath: "student.residencyStatus", terms: ["student residency status", "residency status", "visa status", "citizenship status"] },
  { profilePath: "student.attendedAnotherSchool", terms: ["has student attended another school", "attended another school", "previous school"] },
  { profilePath: "student.aboriginalOrTorresStraitIslander", terms: ["aboriginal or torres strait islander", "aboriginal", "torres strait"] },
  { profilePath: "student.languageOtherThanEnglishAtHome", terms: ["language other than english", "speak a language", "english only"] },

  { profilePath: "address.postcode", terms: ["postcode", "post code", "postal code", "zip code"] },
  // Deliberately do not include "city" here. Country select option lists include
  // values like "Vatican City State", which caused false suburb matches.
  { profilePath: "address.suburb", terms: ["suburb", "town"], blockWhen: ["country", "country of birth"] },
  { profilePath: "address.state", terms: ["state"], blockWhen: ["residency status", "country"] },
  {
    profilePath: "address.country",
    terms: ["address country", "residential country"],
    secondaryTerms: ["address country", "residential country"],
    blockWhen: ["country of birth", "student country of birth", "birth country"]
  },
  { profilePath: "address.line1", terms: ["street address", "address line 1", "street number", "street name", "street"], secondaryTerms: ["residential address", "home address"] },
  { profilePath: "address.fullAddress", terms: ["full residential address", "full home address", "full address"] }
];

function normalise(text = ""): string {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function fieldText(field: any): { primary: string; secondary: string; option: string; combined: string } {
  const primary = normalise([field.title, field.label, field.name, field.fieldId, field.placeholder].filter(Boolean).join(" "));
  const option = normalise([field.groupLabel, field.optionLabel].filter(Boolean).join(" "));
  const secondary = normalise([field.section, field.helpText, field.fieldType].filter(Boolean).join(" "));

  return { primary, secondary, option, combined: `${primary} ${option} ${secondary}`.trim() };
}

export const keywordMatcher: Matcher = {
  name: "keyword",

  match(field): MatchResult | null {
    const { primary, secondary, option, combined } = fieldText(field);
    let best: MatchResult | null = null;
    let bestScore = 0;

    for (const rule of rules) {
      if (rule.blockWhen?.some((blocked) => combined.includes(normalise(blocked)))) continue;

      for (const term of rule.terms.map(normalise)) {
        const matchedPrimary = primary.includes(term);
        const matchedOptionGroup = option.includes(term);
        if (!matchedPrimary && !matchedOptionGroup) continue;

        const specificity = term.split(" ").length;
        const score = (matchedPrimary ? 100 : 90) + specificity;

        if (score > bestScore) {
          bestScore = score;
          best = {
            profilePath: rule.profilePath,
            confidence: matchedPrimary ? 0.95 : 0.9,
            strategy: "keyword",
            reason: `Matched "${term}" in ${matchedPrimary ? "field label/name/title" : "option group"}`
          };
        }
      }

      for (const term of (rule.secondaryTerms ?? []).map(normalise)) {
        if (!secondary.includes(term)) continue;

        const specificity = term.split(" ").length;
        const score = 55 + specificity;

        if (score > bestScore) {
          bestScore = score;
          best = {
            profilePath: rule.profilePath,
            confidence: 0.6,
            strategy: "keyword",
            reason: `Matched "${term}" in section/help text`
          };
        }
      }
    }

    return best;
  }
};
