import { canonicalProfileToIdentityGraph } from "@gov-form-copilot/shared";

import { Router } from "express";
import { loadEvidenceDocuments } from "../evidence/evidenceStore.js";
import { buildIdentityGraph } from "../evidence/identityGraphBuilder.js";

export const identityGraphRouter = Router();

identityGraphRouter.get("/identity-graph", async (_req, res, next) => {
  try {
    const evidenceDocuments = await loadEvidenceDocuments();
    const identityGraph = buildIdentityGraph(evidenceDocuments);

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

