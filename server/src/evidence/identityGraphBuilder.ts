import {
  createId,
  type Address,
  type ApplicationContext,
  type ContactMethod,
  type EvidenceDocument,
  type Household,
  type IdentityGraph,
  type Person,
  type Relationship
} from "@gov-form-copilot/shared";
import {
  deriveFullNameFact,
  hasFactValue,
  mergeEvidenceRefs,
  resolveFact
} from "./evidenceResolver.js";

function buildStudent(evidenceDocuments: EvidenceDocument[]): Person {
  const givenName = resolveFact(evidenceDocuments, "student.givenName");
  const middleName = resolveFact(evidenceDocuments, "student.middleName");
  const familyName = resolveFact(evidenceDocuments, "student.familyName");
  const preferredName = resolveFact(evidenceDocuments, "student.preferredName");
  const dateOfBirth = resolveFact(evidenceDocuments, "student.dateOfBirth");
  const gender = resolveFact(evidenceDocuments, "student.gender");
  const countryOfBirth = resolveFact(evidenceDocuments, "student.countryOfBirth");

  const displayName =
    [preferredName.value ?? givenName.value, familyName.value]
      .filter(Boolean)
      .join(" ") || "Unknown student";

  const identitySeed =
    [givenName.value, middleName.value, familyName.value, dateOfBirth.value]
      .filter(Boolean)
      .join("-") || displayName;

  return {
    id: createId("person", identitySeed),
    displayName,
    name: {
      legal: {
        givenName,
        middleName,
        familyName,
        fullName: deriveFullNameFact(givenName, familyName, middleName)
      },
      preferredName
    },
    demographics: {
      dateOfBirth,
      gender,
      countryOfBirth
    },
    evidenceRefs: mergeEvidenceRefs(
      givenName.evidenceRefs,
      middleName.evidenceRefs,
      familyName.evidenceRefs,
      preferredName.evidenceRefs,
      dateOfBirth.evidenceRefs,
      gender.evidenceRefs,
      countryOfBirth.evidenceRefs
    )
  };
}

function buildParent(evidenceDocuments: EvidenceDocument[]): Person | undefined {
  const givenName = resolveFact(evidenceDocuments, "parent.givenName");
  const familyName = resolveFact(evidenceDocuments, "parent.familyName");
  const email = resolveFact(evidenceDocuments, "parent.email");
  const mobile = resolveFact(evidenceDocuments, "parent.mobile");

  const hasParentIdentity =
    hasFactValue(givenName) ||
    hasFactValue(familyName) ||
    hasFactValue(email) ||
    hasFactValue(mobile);

  if (!hasParentIdentity) return undefined;

  const contacts: ContactMethod[] = [];

  if (hasFactValue(email)) {
    contacts.push({
      id: createId("contact", `email-${String(email.value)}`),
      type: "email",
      value: email,
      primary: true
    });
  }

  if (hasFactValue(mobile)) {
    contacts.push({
      id: createId("contact", `mobile-${String(mobile.value)}`),
      type: "mobile",
      value: mobile,
      primary: true
    });
  }

  const displayName =
    [givenName.value, familyName.value].filter(Boolean).join(" ") ||
    String(email.value ?? mobile.value ?? "Unknown parent");

  const identitySeed =
    [givenName.value, familyName.value, email.value, mobile.value]
      .filter(Boolean)
      .join("-") || displayName;

  return {
    id: createId("person", identitySeed),
    displayName,
    name: {
      legal: {
        givenName,
        familyName,
        fullName: deriveFullNameFact(givenName, familyName)
      }
    },
    contacts,
    evidenceRefs: mergeEvidenceRefs(
      givenName.evidenceRefs,
      familyName.evidenceRefs,
      email.evidenceRefs,
      mobile.evidenceRefs
    )
  };
}

function buildAddress(evidenceDocuments: EvidenceDocument[]): Address | undefined {
  const line1 = resolveFact(evidenceDocuments, "address.line1");
  const suburb = resolveFact(evidenceDocuments, "address.suburb");
  const state = resolveFact(evidenceDocuments, "address.state");
  const postcode = resolveFact(evidenceDocuments, "address.postcode");
  const country = resolveFact(evidenceDocuments, "address.country");
  const fullAddress = resolveFact(evidenceDocuments, "address.fullAddress");

  const hasAddress =
    hasFactValue(line1) ||
    hasFactValue(suburb) ||
    hasFactValue(state) ||
    hasFactValue(postcode) ||
    hasFactValue(country) ||
    hasFactValue(fullAddress);

  if (!hasAddress) return undefined;

  const addressSeed =
    fullAddress.value ??
    [line1.value, suburb.value, state.value, postcode.value, country.value]
      .filter(Boolean)
      .join("-");

  return {
    id: createId("address", String(addressSeed)),
    type: "residential",
    line1,
    suburb,
    state,
    postcode,
    country,
    fullAddress,
    primary: true,
    evidenceRefs: mergeEvidenceRefs(
      line1.evidenceRefs,
      suburb.evidenceRefs,
      state.evidenceRefs,
      postcode.evidenceRefs,
      country.evidenceRefs,
      fullAddress.evidenceRefs
    )
  };
}

function linkAddress(person: Person, address: Address | undefined): void {
  if (!address) return;

  person.addresses = [{
    addressId: address.id,
    type: "residential",
    primary: true,
    evidenceRefs: address.evidenceRefs
  }];
}

function buildRelationship(parent: Person, student: Person): Relationship {
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
    addressIds: address ? [address.id] : []
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
        ? [{
            formRole: "parent_1" as const,
            personId: parent.id,
            source: "migration" as const,
            confidence: 0.9,
            evidenceRefs: parent.evidenceRefs
          }]
        : [])
    ]
  };
}

export function buildIdentityGraph(
  evidenceDocuments: EvidenceDocument[]
): IdentityGraph {
  const student = buildStudent(evidenceDocuments);
  const parent = buildParent(evidenceDocuments);
  const address = buildAddress(evidenceDocuments);

  linkAddress(student, address);
  if (parent) linkAddress(parent, address);

  const household = parent
    ? buildHousehold(student, parent, address)
    : undefined;

  return {
    people: parent ? [student, parent] : [student],
    relationships: parent ? [buildRelationship(parent, student)] : [],
    households: household ? [household] : [],
    addresses: address ? [address] : [],
    applications: [buildApplication(student, parent, household)]
  };
}
