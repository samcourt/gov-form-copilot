import type {
  CanonicalProfile,
  EvidenceDocument,
  EvidenceStatus,
  EvidenceValue,
  ProfileField
} from "@gov-form-copilot/shared";

const PROFILE_PATHS = [
  "student.givenName",
  "student.middleName",
  "student.familyName",
  "student.preferredName",
  "student.dateOfBirth",
  "student.gender",
  "student.countryOfBirth",
  "student.residencyStatus",
  "student.aboriginalOrTorresStraitIslander",
  "student.languageOtherThanEnglishAtHome",
  "student.attendedAnotherSchool",

  "parent.givenName",
  "parent.familyName",
  "parent.email",
  "parent.mobile",

  "address.line1",
  "address.suburb",
  "address.state",
  "address.postcode",
  "address.country",
  "address.fullAddress"
] as const;

const SOURCE_AUTHORITY: Record<string, number> = {
  birth_certificate: 1.0,
  passport: 0.95,
  medicare: 0.85,
  immunisation: 0.85,
  utility_bill: 0.8,
  parent_declaration: 0.65,
  unknown: 0.4
};

function scoreEvidence(confidence: number, sourceType: string): number {
  return confidence * (SOURCE_AUTHORITY[sourceType] ?? SOURCE_AUTHORITY.unknown);
}

function emptyField(path: string): ProfileField {
  return {
    path,
    confidence: 0,
    status: "unsupported",
    evidence: [],
    conflicts: [],
    reason: "No supporting evidence found."
  };
}

function valuesEqual(a: unknown, b: unknown): boolean {
  return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

function collect(docs: EvidenceDocument[], profilePath: string): EvidenceValue[] {
  return docs
    .map((doc) => doc.values[profilePath])
    .filter((value): value is EvidenceValue => Boolean(value));
}

function chooseBest(profilePath: string, values: EvidenceValue[]): ProfileField {
  if (values.length === 0) return emptyField(profilePath);

  const ranked = [...values].sort(
    (a, b) => scoreEvidence(b.confidence, b.sourceType) - scoreEvidence(a.confidence, a.sourceType)
  );

  const best = ranked[0];
  const conflicts = ranked.filter((item) => !valuesEqual(item.value, best.value));
  const confidence = scoreEvidence(best.confidence, best.sourceType);

  const status: EvidenceStatus =
    conflicts.length > 0 ? "conflicted" : confidence >= 0.8 ? "verified" : "needs_review";

  return {
    path: profilePath,
    value: best.value,
    confidence: Number(confidence.toFixed(3)),
    status,
    evidence: ranked,
    conflicts,
    reason:
      conflicts.length > 0
        ? `Selected ${best.sourceLabel}, but found conflicting evidence.`
        : `Selected highest-ranked evidence from ${best.sourceLabel}.`
  };
}

function setPath(target: Record<string, unknown>, dottedPath: string, value: unknown): void {
  const parts = dottedPath.split(".");
  let node = target;

  for (const part of parts.slice(0, -1)) {
    node[part] ??= {};
    node = node[part] as Record<string, unknown>;
  }

  node[parts[parts.length - 1]] = value;
}

export function buildProfile(docs: EvidenceDocument[]): CanonicalProfile {
  const profile = {} as CanonicalProfile;

  for (const profilePath of PROFILE_PATHS) {
    const field = chooseBest(profilePath, collect(docs, profilePath));
    setPath(profile as unknown as Record<string, unknown>, profilePath, field);
  }

  return profile;
}
