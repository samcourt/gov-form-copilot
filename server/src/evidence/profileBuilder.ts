import type {
  CanonicalProfile,
  EvidenceDocument,
  EvidenceStatus,
  EvidenceValue,
  ProfileBuildResult,
  ProfileField
} from "@gov-form-copilot/shared";
import { scoreEvidence } from "./authority.js";
import { PROFILE_PATHS } from "./profilePaths.js";

function emptyField(path: string): ProfileField {
  return { path, confidence: 0, status: "unsupported", evidence: [], conflicts: [], reason: "No supporting evidence found." };
}

function valuesEqual(a: unknown, b: unknown): boolean {
  return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

function collect(docs: EvidenceDocument[], path: string): EvidenceValue[] {
  return docs.map((doc) => doc.values[path]).filter((value): value is EvidenceValue => Boolean(value));
}

function chooseBest(path: string, values: EvidenceValue[]): ProfileField {
  if (values.length === 0) return emptyField(path);

  const ranked = [...values].sort(
    (a, b) => scoreEvidence(b.confidence, b.sourceType) - scoreEvidence(a.confidence, a.sourceType)
  );

  const best = ranked[0];
  const conflicts = ranked.filter((item) => !valuesEqual(item.value, best.value));
  const combinedConfidence = scoreEvidence(best.confidence, best.sourceType);

  const status: EvidenceStatus =
    conflicts.length > 0 ? "conflicted" : combinedConfidence >= 0.8 ? "verified" : "needs_review";

  return {
    path,
    value: best.value,
    confidence: Number(combinedConfidence.toFixed(3)),
    status,
    evidence: ranked,
    conflicts,
    reason: conflicts.length > 0
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

export function buildProfile(docs: EvidenceDocument[]): ProfileBuildResult {
  const profile = {} as CanonicalProfile;
  let conflictCount = 0;

  for (const path of PROFILE_PATHS) {
    const field = chooseBest(path, collect(docs, path));
    if (field.conflicts.length > 0) conflictCount += 1;
    setPath(profile as unknown as Record<string, unknown>, path, field);
  }

  return { profile, documents: docs.length, fields: PROFILE_PATHS.length, conflicts: conflictCount, generatedAt: new Date().toISOString() };
}
