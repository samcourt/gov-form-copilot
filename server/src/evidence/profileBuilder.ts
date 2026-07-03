import type { CanonicalProfile, EvidenceDocument, EvidenceValue, ProfileField } from "./types.js";

function emptyField<T = string>(): ProfileField<T> {
  return { confidence: 0, evidence: [], conflicts: [] };
}

function chooseBest<T = string>(values: EvidenceValue<T>[]): ProfileField<T> {
  if (values.length === 0) return emptyField<T>();
  const sorted = [...values].sort((a, b) => b.confidence - a.confidence);
  const best = sorted[0];
  const conflicts = sorted.filter((item) => item.value !== best.value);
  return { value: best.value, confidence: best.confidence, evidence: sorted, conflicts };
}

function collect<T = string>(docs: EvidenceDocument[], pathName: string): EvidenceValue<T>[] {
  return docs
    .map((doc) => doc.values[pathName] as EvidenceValue<T> | undefined)
    .filter((value): value is EvidenceValue<T> => Boolean(value));
}

export function buildProfile(docs: EvidenceDocument[]): CanonicalProfile {
  return {
    student: {
      givenName: chooseBest(collect(docs, "student.givenName")),
      familyName: chooseBest(collect(docs, "student.familyName")),
      preferredName: chooseBest(collect(docs, "student.preferredName")),
      dateOfBirth: chooseBest(collect(docs, "student.dateOfBirth")),
      gender: chooseBest(collect(docs, "student.gender"))
    },
    parent: {
      givenName: chooseBest(collect(docs, "parent.givenName")),
      familyName: chooseBest(collect(docs, "parent.familyName")),
      email: chooseBest(collect(docs, "parent.email")),
      mobile: chooseBest(collect(docs, "parent.mobile"))
    },
    address: {
      line1: chooseBest(collect(docs, "address.line1")),
      suburb: chooseBest(collect(docs, "address.suburb")),
      state: chooseBest(collect(docs, "address.state")),
      postcode: chooseBest(collect(docs, "address.postcode")),
      country: chooseBest(collect(docs, "address.country")),
      fullAddress: chooseBest(collect(docs, "address.fullAddress"))
    }
  };
}
