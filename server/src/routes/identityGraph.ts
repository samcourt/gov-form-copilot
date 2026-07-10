import { Router } from "express";
import { canonicalProfileToIdentityGraph } from "@gov-form-copilot/shared";
import { loadEvidenceDocuments } from "../evidence/evidenceStore.js";
import { buildProfile } from "../evidence/profileBuilder.js";

export const identityGraphRouter = Router();

identityGraphRouter.get("/identity-graph", async (_req, res, next) => {
  try {
    const evidenceDocuments = await loadEvidenceDocuments();
    const profile = buildProfile(evidenceDocuments);
    const identityGraph = canonicalProfileToIdentityGraph(profile);

    res.json({
      ok: true,
      identityGraph,
      evidenceDocuments,
      summary: {
        people: identityGraph.people.length,
        relationships: identityGraph.relationships.length,
        households: identityGraph.households.length,
        addresses: identityGraph.addresses.length,
        applications: identityGraph.applications.length,
        documents: evidenceDocuments.length
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});