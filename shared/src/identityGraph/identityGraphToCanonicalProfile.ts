import type {
  CanonicalProfile,
  EvidenceDocument,
  EvidenceRef,
  EvidenceValue,
  Fact,
  IdentityGraph,
  Person,
  ProfileField
} from "../models/index.js";

function unsupportedField(path: string): ProfileField {
  return {
    path,
    confidence: 0,
    status: "unsupported",
    evidence: [],
    conflicts: [],
    reason: "No supporting fact found in the identity graph."
  };
}

function resolveEvidenceValue<T>(
  ref: EvidenceRef,
  value: T,
  documents: EvidenceDocument[]
): EvidenceValue<T> {
  const document = documents.find((item) => item.id === ref.evidenceId);
  const extractedValue = ref.fieldPath
    ? document?.values[ref.fieldPath]
    : undefined;

  if (extractedValue) {
    return extractedValue as EvidenceValue<T>;
  }

  return {
    value,
    sourceId: ref.evidenceId,
    sourceType: document?.type ?? "unknown",
    sourceLabel: document?.label ?? ref.evidenceId,
    confidence: ref.confidence ?? 0,
    extractedAt: document?.extractedAt
  };
}

function factToProfileField<T>(
  path: string,
  fact: Fact<T> | undefined,
  documents: EvidenceDocument[]
): ProfileField<T> {
  if (!fact) {
    return unsupportedField(path) as ProfileField<T>;
  }

  const evidence =
    fact.value === undefined
      ? []
      : fact.evidenceRefs.map((ref) =>
          resolveEvidenceValue(ref, fact.value as T, documents)
        );

  const conflicts = (fact.conflicts ?? []).flatMap((conflict) =>
    conflict.evidenceRefs.map((ref) =>
      resolveEvidenceValue(ref, conflict.value, documents)
    )
  );

  return {
    path,
    value: fact.value,
    confidence: fact.confidence,
    status: fact.status,
    evidence,
    conflicts,
    reason: fact.reason
  };
}

function findApplicationPeople(graph: IdentityGraph): {
  student?: Person;
  parent?: Person;
} {
  const application =
    graph.applications.find(
      (item) => item.applicationType === "school_enrolment"
    ) ?? graph.applications[0];

  if (!application) {
    return {};
  }

  const studentMapping = application.roleMappings.find(
    (mapping) =>
      mapping.formRole === "student" ||
      mapping.formRole === "child"
  );

  const parentMapping = application.roleMappings.find(
    (mapping) =>
      mapping.formRole === "parent_1" ||
      mapping.formRole === "parent_2" ||
      mapping.formRole === "carer"
  );

  const studentId =
    studentMapping?.personId ?? application.subjectPersonId;

  const parentId =
    parentMapping?.personId ?? application.primaryApplicantPersonId;

  return {
    student: graph.people.find((person) => person.id === studentId),
    parent: graph.people.find((person) => person.id === parentId)
  };
}

function findResidentialAddress(
  graph: IdentityGraph,
  student: Person | undefined
) {
  const addressReference =
    student?.addresses?.find(
      (item) => item.primary || item.type === "residential"
    ) ?? student?.addresses?.[0];

  if (addressReference) {
    return graph.addresses.find(
      (address) => address.id === addressReference.addressId
    );
  }

  return (
    graph.addresses.find(
      (address) => address.primary || address.type === "residential"
    ) ?? graph.addresses[0]
  );
}

function findContactFact(
  person: Person | undefined,
  type: "email" | "mobile"
): Fact<string> | undefined {
  return person?.contacts?.find((contact) => contact.type === type)?.value;
}

export function identityGraphToCanonicalProfile(
  graph: IdentityGraph,
  evidenceDocuments: EvidenceDocument[]
): CanonicalProfile {
  const { student, parent } = findApplicationPeople(graph);
  const address = findResidentialAddress(graph, student);

  return {
    student: {
      givenName: factToProfileField(
        "student.givenName",
        student?.name.legal.givenName,
        evidenceDocuments
      ),
      middleName: factToProfileField(
        "student.middleName",
        student?.name.legal.middleName,
        evidenceDocuments
      ),
      familyName: factToProfileField(
        "student.familyName",
        student?.name.legal.familyName,
        evidenceDocuments
      ),
      preferredName: factToProfileField(
        "student.preferredName",
        student?.name.preferredName,
        evidenceDocuments
      ),
      dateOfBirth: factToProfileField(
        "student.dateOfBirth",
        student?.demographics?.dateOfBirth,
        evidenceDocuments
      ),
      gender: factToProfileField(
        "student.gender",
        student?.demographics?.gender,
        evidenceDocuments
      ),
      countryOfBirth: factToProfileField(
        "student.countryOfBirth",
        student?.demographics?.countryOfBirth,
        evidenceDocuments
      ),

      residencyStatus: unsupportedField(
        "student.residencyStatus"
      ),
      aboriginalOrTorresStraitIslander: unsupportedField(
        "student.aboriginalOrTorresStraitIslander"
      ),
      languageOtherThanEnglishAtHome: unsupportedField(
        "student.languageOtherThanEnglishAtHome"
      ),
      attendedAnotherSchool: unsupportedField(
        "student.attendedAnotherSchool"
      )
    },

    parent: {
      givenName: factToProfileField(
        "parent.givenName",
        parent?.name.legal.givenName,
        evidenceDocuments
      ),
      familyName: factToProfileField(
        "parent.familyName",
        parent?.name.legal.familyName,
        evidenceDocuments
      ),
      email: factToProfileField(
        "parent.email",
        findContactFact(parent, "email"),
        evidenceDocuments
      ),
      mobile: factToProfileField(
        "parent.mobile",
        findContactFact(parent, "mobile"),
        evidenceDocuments
      )
    },

    address: {
      line1: factToProfileField(
        "address.line1",
        address?.line1,
        evidenceDocuments
      ),
      suburb: factToProfileField(
        "address.suburb",
        address?.suburb,
        evidenceDocuments
      ),
      state: factToProfileField(
        "address.state",
        address?.state,
        evidenceDocuments
      ),
      postcode: factToProfileField(
        "address.postcode",
        address?.postcode,
        evidenceDocuments
      ),
      country: factToProfileField(
        "address.country",
        address?.country,
        evidenceDocuments
      ),
      fullAddress: factToProfileField(
        "address.fullAddress",
        address?.fullAddress,
        evidenceDocuments
      )
    }
  };
}