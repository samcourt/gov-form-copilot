import { Router } from "express";
import type { CanonicalProfile, EvidenceDocument } from "@gov-form-copilot/shared";
import type { ExtractTextRequest, StructuredEvidenceRequest } from "../ingestion/types.js";
import { createEvidenceDocumentFromValues } from "../ingestion/evidenceFactory.js";
import { extractEvidenceFromText } from "../ingestion/ruleBasedExtractor.js";
import { loadEvidenceDocuments, saveEvidenceDocument } from "../evidence/evidenceStore.js";
import { buildProfile } from "../evidence/profileBuilder.js";

export const documentsRouter = Router();

documentsRouter.post("/documents/evidence", async (req, res, next) => {
  try {
    const body = req.body as StructuredEvidenceRequest;

    if (!body?.sourceType || !body?.label || !body?.values) {
      return res.status(400).json({
        ok: false,
        error: "Request must include sourceType, label and values."
      });
    }

    const evidenceDocument = createEvidenceDocumentFromValues({
      id: body.id,
      type: body.sourceType,
      label: body.label,
      values: body.values,
      confidence: 0.9
    });

    await saveEvidenceDocument(evidenceDocument);

    const evidenceDocuments = await loadEvidenceDocuments();
    const profile = buildProfile(evidenceDocuments);

    res.json({
      ok: true,
      evidenceDocument,
      profile,
      profileSummary: summariseProfile(profile, evidenceDocuments.length)
    });
  } catch (error) {
    next(error);
  }
});

documentsRouter.post("/documents/extract-text", async (req, res, next) => {
  try {
    const body = req.body as ExtractTextRequest;

    if (!body?.sourceType || !body?.label || !body?.rawText) {
      return res.status(400).json({
        ok: false,
        error: "Request must include sourceType, label and rawText."
      });
    }

    const evidenceDocument = extractEvidenceFromText({
      sourceType: body.sourceType,
      label: body.label,
      rawText: body.rawText
    });

    await saveEvidenceDocument(evidenceDocument);

    const evidenceDocuments = await loadEvidenceDocuments();
    const profile = buildProfile(evidenceDocuments);

    res.json({
      ok: true,
      evidenceDocument,
      extractedFields: Object.keys(evidenceDocument.values),
      profile,
      profileSummary: summariseProfile(profile, evidenceDocuments.length)
    });
  } catch (error) {
    next(error);
  }
});

documentsRouter.post("/documents/import", async (req, res, next) => {
  try {
    const document = req.body as EvidenceDocument;

    if (!document?.id || !document?.type || !document?.label || !document?.values) {
      return res.status(400).json({
        ok: false,
        error: "Request body must be a valid EvidenceDocument."
      });
    }

    await saveEvidenceDocument(document);

    res.json({
      ok: true,
      evidenceDocument: document
    });
  } catch (error) {
    next(error);
  }
});

function summariseProfile(profile: CanonicalProfile, documents: number) {
  const fields = flattenProfileFields(profile);

  return {
    documents,
    fields: fields.length,
    conflicts: fields.filter((field) => Array.isArray(field.conflicts) && field.conflicts.length > 0).length,
    generatedAt: new Date().toISOString()
  };
}

function flattenProfileFields(profile: CanonicalProfile): Array<{ conflicts?: unknown[] }> {
  const fields: Array<{ conflicts?: unknown[] }> = [];

  function walk(value: unknown): void {
    if (!value || typeof value !== "object") return;

    if ("confidence" in value && "evidence" in value && "conflicts" in value) {
      fields.push(value as { conflicts?: unknown[] });
      return;
    }

    for (const child of Object.values(value)) {
      walk(child);
    }
  }

  walk(profile);
  return fields;
}
