import type { Matcher, MatchResult } from "./types.js";

type PersonContext = "student" | "parent" | "unknown";

interface Rule {
  profilePath: string;
  terms: string[];
  secondaryTerms?: string[];
  blockWhen?: string[];
  context?: PersonContext;
}

const rules: Rule[] = [
  // Parent/carer identity
  {
    profilePath: "parent.givenName",
    context: "parent",
    terms: [
      "parent given name",
      "parent first name",
      "parent carer given name",
      "parent carer first name",
      "carer given name",
      "carer first name",
      "guardian given name",
      "guardian first name",
      "given name",
      "first name"
    ]
  },
  {
    profilePath: "parent.familyName",
    context: "parent",
    terms: [
      "parent family name",
      "parent surname",
      "parent last name",
      "parent carer family name",
      "parent carer surname",
      "carer family name",
      "carer surname",
      "guardian family name",
      "guardian surname",
      "family name",
      "surname",
      "last name"
    ]
  },
  {
    profilePath: "parent.email",
    context: "parent",
    terms: [
      "parent email",
      "parent email address",
      "parent carer email",
      "parent carer contact email",
      "carer email",
      "guardian email",
      "contact email",
      "email address",
      "email"
    ]
  },
  {
    profilePath: "parent.mobile",
    context: "parent",
    terms: [
      "parent mobile",
      "parent phone",
      "parent telephone",
      "parent contact number",
      "parent carer contact number",
      "carer mobile",
      "carer phone",
      "guardian mobile",
      "guardian phone",
      "phone number",
      "contact number",
      "mobile",
      "phone",
      "telephone"
    ],
    blockWhen: ["phone number type"]
  },

  // Student identity
  {
    profilePath: "student.givenName",
    context: "student",
    terms: [
      "student given name",
      "student first name",
      "child given name",
      "child first name",
      "applicant given name",
      "given name",
      "first name"
    ]
  },
  {
    profilePath: "student.middleName",
    context: "student",
    terms: [
      "student middle name",
      "child middle name",
      "middle name"
    ]
  },
  {
    profilePath: "student.familyName",
    context: "student",
    terms: [
      "student family name",
      "student surname",
      "child family name",
      "child surname",
      "applicant family name",
      "family name",
      "surname",
      "last name"
    ]
  },
  {
    profilePath: "student.preferredName",
    context: "student",
    terms: ["preferred name"]
  },
  {
    profilePath: "student.dateOfBirth",
    context: "student",
    terms: [
      "student date of birth day",
      "student date of birth month",
      "student date of birth year",
      "student date of birth",
      "child date of birth",
      "date of birth",
      "dob",
      "birth date"
    ],
    blockWhen: [
      "intended start date",
      "start date",
      "commencement date"
    ]
  },
  {
    profilePath: "student.gender",
    context: "student",
    terms: ["student gender", "gender", "sex"]
  },
  {
    profilePath: "student.countryOfBirth",
    context: "student",
    terms: [
      "student country of birth",
      "country of birth",
      "birth country",
      "born in country"
    ]
  },
  {
    profilePath: "student.residencyStatus",
    context: "student",
    terms: [
      "student residency status",
      "residency status",
      "visa status",
      "citizenship status"
    ]
  },
  {
    profilePath: "student.attendedAnotherSchool",
    context: "student",
    terms: [
      "has student attended another school",
      "attended another school",
      "previous school"
    ]
  },
  {
    profilePath: "student.aboriginalOrTorresStraitIslander",
    context: "student",
    terms: [
      "student aboriginal or torres strait islander",
      "aboriginal or torres strait islander",
      "aboriginal",
      "torres strait"
    ]
  },
  {
    profilePath: "student.languageOtherThanEnglishAtHome",
    context: "student",
    terms: [
      "language other than english",
      "speak a language",
      "english only"
    ]
  },

  // Address
  {
    profilePath: "address.postcode",
    terms: ["postcode", "post code", "postal code", "zip code"]
  },
  {
    profilePath: "address.suburb",
    terms: ["suburb", "town"],
    blockWhen: ["country", "country of birth"]
  },
  {
    profilePath: "address.state",
    terms: ["state"],
    blockWhen: ["residency status", "country"]
  },
  {
    profilePath: "address.country",
    terms: ["address country", "residential country"],
    secondaryTerms: ["address country", "residential country"],
    blockWhen: [
      "country of birth",
      "student country of birth",
      "birth country"
    ]
  },
  {
    profilePath: "address.line1",
    terms: [
      "street address",
      "address line 1",
      "street number",
      "street name",
      "street"
    ],
    secondaryTerms: ["residential address", "home address"]
  },
  {
    profilePath: "address.fullAddress",
    terms: [
      "full residential address",
      "full home address",
      "full address"
    ]
  }
];

function normalise(text = ""): string {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function fieldText(field: any): {
  primary: string;
  secondary: string;
  option: string;
  combined: string;
} {
  const primary = normalise(
    [
      field.title,
      field.label,
      field.name,
      field.fieldId,
      field.placeholder
    ]
      .filter(Boolean)
      .join(" ")
  );

  const option = normalise(
    [field.groupLabel, field.optionLabel]
      .filter(Boolean)
      .join(" ")
  );

  const secondary = normalise(
    [field.section, field.helpText, field.fieldType]
      .filter(Boolean)
      .join(" ")
  );

  return {
    primary,
    secondary,
    option,
    combined: `${primary} ${option} ${secondary}`.trim()
  };
}

function inferPersonContext(
  primary: string,
  secondary: string,
  option: string
): PersonContext {
  const combined = `${primary} ${option} ${secondary}`;

  const parentContext =
    /\bparent\b/.test(combined) ||
    /\bcarer\b/.test(combined) ||
    /\bguardian\b/.test(combined);

  const studentContext =
    /\bstudent\b/.test(combined) ||
    /\bchild\b/.test(combined);

  // A page may mention both student and parent. Prefer the context nearest
  // the field itself before falling back to wider section/help text.
  const primaryAndOption = `${primary} ${option}`;

  if (
    /\bparent\b/.test(primaryAndOption) ||
    /\bcarer\b/.test(primaryAndOption) ||
    /\bguardian\b/.test(primaryAndOption)
  ) {
    return "parent";
  }

  if (
    /\bstudent\b/.test(primaryAndOption) ||
    /\bchild\b/.test(primaryAndOption)
  ) {
    return "student";
  }

  if (parentContext && !studentContext) return "parent";
  if (studentContext && !parentContext) return "student";

  // On mixed pages, section-level parent/carer context is still important.
  if (
    /\bparent\b/.test(secondary) ||
    /\bcarer\b/.test(secondary) ||
    /\bguardian\b/.test(secondary)
  ) {
    return "parent";
  }

  if (
    /\bstudent\b/.test(secondary) ||
    /\bchild\b/.test(secondary)
  ) {
    return "student";
  }

  return "unknown";
}

function contextAllowsRule(
  rule: Rule,
  fieldContext: PersonContext
): boolean {
  if (!rule.context) return true;

  if (fieldContext === "unknown") {
    // Preserve existing student defaults on pages without useful context.
    return rule.context === "student";
  }

  return rule.context === fieldContext;
}

export const keywordMatcher: Matcher = {
  name: "keyword",

  match(field): MatchResult | null {
    const {
      primary,
      secondary,
      option,
      combined
    } = fieldText(field);

    const fieldContext = inferPersonContext(
      primary,
      secondary,
      option
    );

    let best: MatchResult | null = null;
    let bestScore = 0;

    for (const rule of rules) {
      if (!contextAllowsRule(rule, fieldContext)) {
        continue;
      }

      if (
        rule.blockWhen?.some((blocked) =>
          combined.includes(normalise(blocked))
        )
      ) {
        continue;
      }

      for (const term of rule.terms.map(normalise)) {
        const matchedPrimary = primary.includes(term);
        const matchedOptionGroup = option.includes(term);

        if (!matchedPrimary && !matchedOptionGroup) {
          continue;
        }

        const specificity = term.split(" ").length;

        // Reward a context-specific rule when the page context agrees.
        const contextBonus =
          rule.context && rule.context === fieldContext ? 25 : 0;

        const score =
          (matchedPrimary ? 100 : 90) +
          specificity +
          contextBonus;

        if (score > bestScore) {
          bestScore = score;
          best = {
            profilePath: rule.profilePath,
            confidence:
              fieldContext === rule.context
                ? 0.98
                : matchedPrimary
                  ? 0.95
                  : 0.9,
            strategy: "keyword",
            reason:
              `Matched "${term}" in ` +
              `${matchedPrimary
                ? "field label/name/title"
                : "option group"}` +
              `${rule.context
                ? ` with ${rule.context} context`
                : ""}`
          };
        }
      }

      for (
        const term of (rule.secondaryTerms ?? []).map(normalise)
      ) {
        if (!secondary.includes(term)) continue;

        const specificity = term.split(" ").length;
        const contextBonus =
          rule.context && rule.context === fieldContext ? 25 : 0;

        const score = 55 + specificity + contextBonus;

        if (score > bestScore) {
          bestScore = score;
          best = {
            profilePath: rule.profilePath,
            confidence:
              fieldContext === rule.context ? 0.75 : 0.6,
            strategy: "keyword",
            reason:
              `Matched "${term}" in section/help text` +
              `${rule.context
                ? ` with ${rule.context} context`
                : ""}`
          };
        }
      }
    }

    return best;
  }
};