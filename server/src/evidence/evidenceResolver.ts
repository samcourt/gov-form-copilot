import type {
  EvidenceDocument,
  EvidenceRef,
  EvidenceStatus,
  EvidenceValue,
  Fact
} from "@gov-form-copilot/shared";

const SOURCE_AUTHORITY: Record<string, number> = {
  birth_certificate: 1.0,
  passport: 0.95,
  medicare: 0.85,
  immunisation: 0.85,
  utility_bill: 0.8,
  parent_declaration: 0.65,
  unknown: 0.4
};

function authorityFor(sourceType: string): number {
  return SOURCE_AUTHORITY[sourceType] ?? SOURCE_AUTHORITY.unknown;
}

function scoreEvidence(confidence: number, sourceType: string): number {
  return confidence * authorityFor(sourceType);
}

function valuesEqual(a: unknown, b: unknown): boolean {
  return String(a ?? "").trim().toLowerCase() ===
    String(b ?? "").trim().toLowerCase();
}

function collectEvidenceValues<T = string>(
  documents: EvidenceDocument[],
  path: string
): EvidenceValue<T>[] {
  return documents
    .map((document) => document.values[path] as EvidenceValue<T> | undefined)
    .filter((value): value is EvidenceValue<T> => Boolean(value));
}

function toEvidenceRef<T>(path: string, value: EvidenceValue<T>): EvidenceRef {
  return {
    evidenceId: value.sourceId,
    fieldPath: path,
    confidence: value.confidence
  };
}

export function resolveFact<T = string>(
  documents: EvidenceDocument[],
  path: string
): Fact<T> {
  const values = collectEvidenceValues<T>(documents, path);

  if (values.length === 0) {
    return {
      confidence: 0,
      status: "unsupported",
      evidenceRefs: [],
      conflicts: [],
      reason: "No supporting evidence found."
    };
  }

  const ranked = [...values].sort(
    (a, b) =>
      scoreEvidence(b.confidence, b.sourceType) -
      scoreEvidence(a.confidence, a.sourceType)
  );

  const best = ranked[0];
  const conflictingValues = ranked.filter(
    (item) => !valuesEqual(item.value, best.value)
  );
  const combinedConfidence = scoreEvidence(best.confidence, best.sourceType);

  const status: EvidenceStatus =
    conflictingValues.length > 0
      ? "conflicted"
      : combinedConfidence >= 0.8
        ? "verified"
        : "needs_review";

  return {
    value: best.value,
    confidence: Number(combinedConfidence.toFixed(3)),
    status,
    evidenceRefs: ranked.map((item) => toEvidenceRef(path, item)),
    conflicts: conflictingValues.map((item) => ({
      value: item.value,
      confidence: Number(
        scoreEvidence(item.confidence, item.sourceType).toFixed(3)
      ),
      evidenceRefs: [toEvidenceRef(path, item)],
      reason: `Conflicting value from ${item.sourceLabel}.`
    })),
    reason:
      conflictingValues.length > 0
        ? `Selected ${best.sourceLabel}, but found conflicting evidence.`
        : `Selected highest-ranked evidence from ${best.sourceLabel}.`
  };
}

export function hasFactValue<T>(
  fact: Fact<T> | undefined
): fact is Fact<T> & { value: T } {
  if (!fact || fact.value === undefined || fact.value === null) return false;
  return String(fact.value).trim().length > 0;
}

export function mergeEvidenceRefs(
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

export function deriveFullNameFact(
  givenName: Fact<string>,
  familyName: Fact<string>,
  middleName?: Fact<string>
): Fact<string> {
  const value = [
    givenName.value,
    middleName?.value,
    familyName.value
  ]
    .filter(Boolean)
    .join(" ");

  const facts = [givenName, middleName, familyName].filter(
    (fact): fact is Fact<string> => Boolean(fact)
  );
  const supportedFacts = facts.filter(hasFactValue);

  const confidence =
    supportedFacts.length > 0
      ? Math.min(...supportedFacts.map((fact) => fact.confidence))
      : 0;

  const status: EvidenceStatus =
    facts.some((fact) => fact.status === "conflicted")
      ? "conflicted"
      : supportedFacts.length >= 2 &&
          supportedFacts.every((fact) => fact.status === "verified")
        ? "verified"
        : value
          ? "needs_review"
          : "unsupported";

  return {
    value: value || undefined,
    confidence,
    status,
    evidenceRefs:
      mergeEvidenceRefs(...facts.map((fact) => fact.evidenceRefs)) ?? [],
    conflicts: facts.flatMap((fact) => fact.conflicts ?? []),
    reason: value
      ? "Derived from the selected legal name facts."
      : "No supported legal name could be derived."
  };
}
