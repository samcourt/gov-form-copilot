import type {
  Address,
  ApplicationContext,
  CanonicalProfile,
  EvidenceRef,
  Fact,
  IdentityGraph,
  Person,
  ProfileField
} from "../models/index.js";
import { createId } from "./createId.js";

function getValue<T = string>(field: ProfileField<T>): T | undefined {
  return field.value;
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
        fullName: {
          value:
            [givenName, middleName, familyName].filter(Boolean).join(" ") ||
            undefined,
          confidence: Math.min(
            profile.student.givenName.confidence,
            profile.student.familyName.confidence
          ),
          status:
            profile.student.givenName.status === "conflicted" ||
            profile.student.familyName.status === "conflicted"
              ? "conflicted"
              : profile.student.givenName.status === "verified" &&
                  profile.student.familyName.status === "verified"
                ? "verified"
                : "needs_review",
          evidenceRefs:
            mergeEvidenceRefs(
              toEvidenceRefs(profile.student.givenName),
              toEvidenceRefs(profile.student.middleName),
              toEvidenceRefs(profile.student.familyName)
            ) ?? [],
          reason: "Derived from the selected legal name facts."
        }
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

function buildApplication(student: Person): ApplicationContext {
  return {
    id: createId("application", `school-enrolment-${student.id}`),
    applicationType: "school_enrolment",
    subjectPersonId: student.id,
    roleMappings: [
      {
        formRole: "student",
        personId: student.id,
        source: "migration",
        confidence: 1
      }
    ]
  };
}

export function canonicalProfileToIdentityGraph(
  profile: CanonicalProfile
): IdentityGraph {
  const student = buildStudent(profile);
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
  }

  return {
    people: [student],
    relationships: [],
    households: [],
    addresses: address ? [address] : [],
    applications: [buildApplication(student)]
  };
}