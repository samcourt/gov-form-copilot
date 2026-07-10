import {
  canonicalProfileToIdentityGraph,
  type EvidenceDocument,
  type IdentityGraph
} from "@gov-form-copilot/shared";
import { buildProfile } from "./profileBuilder.js";

/**
 * Transitional v0.6 builder.
 *
 * The API now treats IdentityGraph as its central model, while the existing
 * evidence ranking code is retained temporarily inside buildProfile().
 *
 * The next refactor will build the graph directly from evidence documents.
 */
export function buildIdentityGraph(
  evidenceDocuments: EvidenceDocument[]
): IdentityGraph {
  const legacyProfile = buildProfile(evidenceDocuments);
  return canonicalProfileToIdentityGraph(legacyProfile);
}