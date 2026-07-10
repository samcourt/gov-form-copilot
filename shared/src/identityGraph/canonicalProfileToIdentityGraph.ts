import type {
  Address,
  ApplicationContext,
  CanonicalProfile,
  ContactMethod,
  EvidenceRef,
  Fact,
  Household,
  IdentityGraph,
  Person,
  ProfileField,
  Relationship
} from "../models/index.js";
import { createId } from "./createId.js";

function getValue<T = string>(field: ProfileField<T>): T | undefined {
  return field.value;
}

function hasValue<T>(field: ProfileField<T>): boolean {
  if (field.value === undefined || field.value === null) return false;

  return String(field.value).trim().length > 0;
}

function toEvidenceRefs<T>(field: ProfileField<T>): EvidenceRef[] {
  return field.evidence.map((item) => ({
    evidenceId: item.sourceId,
    fieldPath: field.path,
    confidence: item.confidence
  }));
}

function toFact<T>(field: ProfileField<T>): Fact<T> {
  return {
    value: field.value,
    confidence: field.confidence,
    status: field.status,
    evidenceRefs: toEvidenceRefs(field),
    conflicts: field.conflicts.map((conflict) => ({
      value: conflict.value,
      confidence: conflict.confidence,
      evidenceRefs: [
        {
          evidenceId: conflict.sourceId,
          fieldPath: field.path,
          confidence: conflict.confidence
        }
      ]
    })),
    reason: field.reason
  };
}

function mergeEvidenceRefs(
  ...collections: Array<EvidenceRef[] | undefined>
): EvidenceRef[] | undefined {
  const unique = new Map<string, EvidenceRef>();

  for (const collection of collections) {
    for (const ref of collection ?? []) {
      const key = [
        ref.evidenceId,
        ref.fieldPath ?? "",
        ref.confidence ?? ""
      ].join(":");

      unique.set(key, ref);
    }
  }

  return unique.size > 0 ? [...unique.values()] : undefined;
}

function deriveFullNameFact(
  givenName: ProfileField,
  middleName: ProfileField | undefined,
  familyName: ProfileField
): Fact<string> {
  const value = [
    getValue(givenName),
    middleName ? getValue(middleName) : undefined,
    getValue(familyName)
  ]
    .filter(Boolean)
    .join(" ");

  const fields = [givenName, middleName, familyName].filter(
    (field): field is ProfileField => Boolean(field)
  );

  const supportedFields = fields.filter(hasValue);
  const confidence =
    supportedFields.length > 0
      ? Math.min(...supportedFields.map((field) => field.confidence))
      : 0;

  const status =
    fields.some((field) => field.status === "conflicted")
      ? "conflicted"
      : supportedFields.length >= 2 &&
          supportedFields.every((field) => field.status === "verified")
        ? "verified"
        : value
          ? "needs_review"
          : "unsupported";

  return {
    value: value || undefined,
    confidence,
    status,
    evidenceRefs:
      mergeEvidenceRefs(...fields.map((field) => toEvidenceRefs(field))) ?? [],
    reason: value
      ? "Derived from the selected legal name facts."
      : "No supported legal name could be derived."
  };
}

function buildStudent(profile: CanonicalProfile): Person {
  const givenName = getValue(profile.student.givenName);
  const middleName = getValue(profile.student.middleName);
  const familyName = getValue(profile.student.familyName);
  const preferredName = getValue(profile.student.preferredName);
  const dateOfBirth = getValue(profile.student.dateOfBirth);

  const displayName =
    [preferredName || givenName, familyName].filter(Boolean).join(" ") ||
    "Unknown student";

  const identitySeed =
    [givenName, middleName, familyName, dateOfBirth]
      .filter(Boolean)
      .join("-") || displayName;

  return {
    id: createId("person", identitySeed),
    displayName,
    name: {
      legal: {
        givenName: toFact(profile.student.givenName),
        middleName: toFact(profile.student.middleName),
        familyName: toFact(profile.student.familyName),
        fullName: deriveFullNameFact(
          profile.student.givenName,
          profile.student.middleName,
          profile.student.familyName
        )
      },
      preferredName: toFact(profile.student.preferredName)
    },
    demographics: {
      dateOfBirth: toFact(profile.student.dateOfBirth),
      gender: toFact(profile.student.gender),
      countryOfBirth: toFact(profile.student.countryOfBirth)
    },
    evidenceRefs: mergeEvidenceRefs(
      toEvidenceRefs(profile.student.givenName),
      toEvidenceRefs(profile.student.middleName),
      toEvidenceRefs(profile.student.familyName),
      toEvidenceRefs(profile.student.preferredName),
      toEvidenceRefs(profile.student.dateOfBirth),
      toEvidenceRefs(profile.student.gender),
      toEvidenceRefs(profile.student.countryOfBirth)
    )
  };
}

function buildContactMethods(profile: CanonicalProfile): ContactMethod[] {
  const contacts: ContactMethod[] = [];

  if (hasValue(profile.parent.email)) {
    contacts.push({
      id: createId(
        "contact",
        `email-${String(profile.parent.email.value)}`
      ),
      type: "email",
      value: toFact(profile.parent.email),
      primary: true
    });
  }

  if (hasValue(profile.parent.mobile)) {
    contacts.push({
      id: createId(
        "contact",
        `mobile-${String(profile.parent.mobile.value)}`
      ),
      type: "mobile",
      value: toFact(profile.parent.mobile),
      primary: true
    });
  }

  return contacts;
}

function buildParent(profile: CanonicalProfile): Person | undefined {
  const hasParentIdentity =
    hasValue(profile.parent.givenName) ||
    hasValue(profile.parent.familyName) ||
    hasValue(profile.parent.email) ||
    hasValue(profile.parent.mobile);

  if (!hasParentIdentity) return undefined;

  const givenName = getValue(profile.parent.givenName);
  const familyName = getValue(profile.parent.familyName);
  const email = getValue(profile.parent.email);
  const mobile = getValue(profile.parent.mobile);

  const displayName =
    [givenName, familyName].filter(Boolean).join(" ") ||
    String(email ?? mobile ?? "Unknown parent");

  const identitySeed =
    [givenName, familyName, email, mobile].filter(Boolean).join("-") ||
    displayName;

  return {
    id: createId("person", identitySeed),
    displayName,
    name: {
      legal: {
        givenName: toFact(profile.parent.givenName),
        familyName: toFact(profile.parent.familyName),
        fullName: deriveFullNameFact(
          profile.parent.givenName,
          undefined,
          profile.parent.familyName
        )
      }
    },
    contacts: buildContactMethods(profile),
    evidenceRefs: mergeEvidenceRefs(
      toEvidenceRefs(profile.parent.givenName),
      toEvidenceRefs(profile.parent.familyName),
      toEvidenceRefs(profile.parent.email),
      toEvidenceRefs(profile.parent.mobile)
    )
  };
}

function buildAddress(profile: CanonicalProfile): Address | undefined {
  const line1 = getValue(profile.address.line1);
  const suburb = getValue(profile.address.suburb);
  const state = getValue(profile.address.state);
  const postcode = getValue(profile.address.postcode);
  const country = getValue(profile.address.country);
  const fullAddress = getValue(profile.address.fullAddress);

  const hasAddress =
    line1 || suburb || state || postcode || country || fullAddress;

  if (!hasAddress) return undefined;

  const addressSeed =
    fullAddress ||
    [line1, suburb, state, postcode, country].filter(Boolean).join("-");

  return {
    id: createId("address", addressSeed),
    type: "residential",
    line1: toFact(profile.address.line1),
    suburb: toFact(profile.address.suburb),
    state: toFact(profile.address.state),
    postcode: toFact(profile.address.postcode),
    country: toFact(profile.address.country),
    fullAddress: toFact(profile.address.fullAddress),
    primary: true,
    evidenceRefs: mergeEvidenceRefs(
      toEvidenceRefs(profile.address.line1),
      toEvidenceRefs(profile.address.suburb),
      toEvidenceRefs(profile.address.state),
      toEvidenceRefs(profile.address.postcode),
      toEvidenceRefs(profile.address.country),
      toEvidenceRefs(profile.address.fullAddress)
    )
  };
}

function buildRelationship(
  parent: Person,
  student: Person
): Relationship {
  return {
    id: createId(
      "relationship",
      `${parent.id}-parent-of-${student.id}`
    ),
    fromPersonId: parent.id,
    toPersonId: student.id,
    relationshipType: "parent_of",
    evidenceRefs: parent.evidenceRefs
  };
}

function buildHousehold(
  student: Person,
  parent: Person,
  address: Address | undefined
): Household {
  return {
    id: createId(
      "household",
      `${student.id}-${parent.id}-${address?.id ?? "no-address"}`
    ),
    name: `${student.displayName} household`,
    source: "application_specific",
    members: [
      {
        personId: parent.id,
        role: "adult",
        primaryResident: true,
        evidenceRefs: parent.evidenceRefs
      },
      {
        personId: student.id,
        role: "child",
        primaryResident: true,
        evidenceRefs: student.evidenceRefs
      }
    ],
    addressIds: address ? [address.id] : [],
    evidenceRefs: mergeEvidenceRefs(
      parent.evidenceRefs,
      student.evidenceRefs,
      address?.evidenceRefs
    )
  };
}

function buildApplication(
  student: Person,
  parent: Person | undefined,
  household: Household | undefined
): ApplicationContext {
  return {
    id: createId("application", `school-enrolment-${student.id}`),
    applicationType: "school_enrolment",
    subjectPersonId: student.id,
    primaryApplicantPersonId: parent?.id,
    householdId: household?.id,
    roleMappings: [
      {
        formRole: "student",
        personId: student.id,
        source: "migration",
        confidence: 1
      },
      ...(parent
        ? [
            {
              formRole: "parent_1" as const,
              personId: parent.id,
              source: "migration" as const,
              confidence: 0.9,
              evidenceRefs: parent.evidenceRefs
            }
          ]
        : [])
    ]
  };
}

export function canonicalProfileToIdentityGraph(
  profile: CanonicalProfile
): IdentityGraph {
  const student = buildStudent(profile);
  const parent = buildParent(profile);
  const address = buildAddress(profile);

  if (address) {
    student.addresses = [
      {
        addressId: address.id,
        type: "residential",
        primary: true,
        evidenceRefs: address.evidenceRefs
      }
    ];

    if (parent) {
      parent.addresses = [
        {
          addressId: address.id,
          type: "residential",
          primary: true,
          evidenceRefs: address.evidenceRefs
        }
      ];
    }
  }

  const household =
    parent ? buildHousehold(student, parent, address) : undefined;

  return {
    people: parent ? [student, parent] : [student],
    relationships: parent
      ? [buildRelationship(parent, student)]
      : [],
    households: household ? [household] : [],
    addresses: address ? [address] : [],
    applications: [
      buildApplication(student, parent, household)
    ]
  };
}