import type {
  Matcher,
  MatchResult
} from "./types.js";

interface BindingRule {
  patterns: RegExp[];
  profilePath: string;
}

const parentRules: BindingRule[] = [
  {
    profilePath: "parent.givenName",
    patterns: [
      /parentcarergivenname/i,
      /parentcarerfirstname/i,
      /parentgivenname/i,
      /parentfirstname/i
    ]
  },
  {
    profilePath: "parent.familyName",
    patterns: [
      /parentcarerfamilyname/i,
      /parentcarersurname/i,
      /parentfamilyname/i,
      /parentsurname/i
    ]
  },
  {
    profilePath: "parent.email",
    patterns: [
      /parentcarercontactemail/i,
      /parentcareremail/i,
      /parentemail/i,
      /contactemail/i
    ]
  },
  {
    profilePath: "parent.mobile",
    patterns: [
      /parentcarercontactnumber/i,
      /parentcarermobile/i,
      /parentcarerphone/i,
      /parentmobilenumber/i,
      /parentmobile/i,
      /parentphone/i,
      /phonenumber/i
    ]
  }
];

const studentRules: BindingRule[] = [
  {
    profilePath: "student.givenName",
    patterns: [
      /studentgivenname/i,
      /studentfirstname/i,
      /childgivenname/i
    ]
  },
  {
    profilePath: "student.middleName",
    patterns: [
      /studentmiddlename/i,
      /childmiddlename/i
    ]
  },
  {
    profilePath: "student.familyName",
    patterns: [
      /studentfamilyname/i,
      /studentsurname/i,
      /childfamilyname/i
    ]
  },
  {
    profilePath: "student.dateOfBirth",
    patterns: [
      /studentdateofbirth/i,
      /studentdob/i,
      /childdateofbirth/i
    ]
  },
  {
    profilePath: "student.gender",
    patterns: [
      /studentgender/i,
      /studentsex/i
    ]
  },
  {
    profilePath: "student.countryOfBirth",
    patterns: [
      /studentcountryofbirth/i,
      /studentbirthcountry/i
    ]
  }
];

const addressRules: BindingRule[] = [
  {
    profilePath: "address.line1",
    patterns: [
      /addressline1/i,
      /streetaddress/i,
      /residentialaddressline/i
    ]
  },
  {
    profilePath: "address.suburb",
    patterns: [
      /addresssuburb/i,
      /residentialsuburb/i
    ]
  },
  {
    profilePath: "address.state",
    patterns: [
      /addressstate/i,
      /residentialstate/i
    ]
  },
  {
    profilePath: "address.postcode",
    patterns: [
      /addresspostcode/i,
      /residentialpostcode/i
    ]
  },
  {
    profilePath: "address.country",
    patterns: [
      /addresscountry/i,
      /residentialcountry/i
    ]
  }
];

export const bindingMatcher: Matcher = {
  name: "binding",

  match(field): MatchResult | null {
    const bindingText = normalise(
      [
        field.bindingPath,
        field.bindingProperty,
        field.name,
        field.fieldId
      ]
        .filter(Boolean)
        .join(" ")
    );

    if (!bindingText) {
      return null;
    }

    if (field.entityType === "parentCarer") {
      return findRule(parentRules, bindingText, "parent/carer binding");
    }

    if (field.entityType === "student") {
      return findRule(studentRules, bindingText, "student binding");
    }

    if (field.entityType === "address") {
      return findRule(addressRules, bindingText, "address binding");
    }

    /*
     * Fall back to structural clues when entityType was not inferred
     * by an older extension build.
     */
    if (/parentcarers?\[\d+\]|parentcarer/i.test(bindingText)) {
      return findRule(parentRules, bindingText, "parent/carer binding");
    }

    if (/student|child/i.test(bindingText)) {
      return findRule(studentRules, bindingText, "student binding");
    }

    if (/address|residential/i.test(bindingText)) {
      return findRule(addressRules, bindingText, "address binding");
    }

    return null;
  }
};

function findRule(
  rules: BindingRule[],
  bindingText: string,
  description: string
): MatchResult | null {
  for (const rule of rules) {
    const matchedPattern = rule.patterns.find((pattern) =>
      pattern.test(bindingText)
    );

    if (!matchedPattern) continue;

    return {
      profilePath: rule.profilePath,
      confidence: 0.99,
      strategy: "binding",
      reason:
        `Matched ${description} to ${rule.profilePath}`
    };
  }

  return null;
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9[\]]+/g, "");
}