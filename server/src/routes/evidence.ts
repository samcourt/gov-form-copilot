import { Router } from "express";
import type { EvidenceDocument } from "@gov-form-copilot/shared";
import { loadEvidenceDocuments, saveEvidenceDocument } from "../evidence/evidenceStore.js";

export const evidenceRouter = Router();

evidenceRouter.get("/evidence", async (_req, res, next) => {
  try {
    const evidenceDocuments = await loadEvidenceDocuments();
    res.json({ ok: true, evidenceDocuments });
  } catch (error) {
    next(error);
  }
});

evidenceRouter.post("/evidence", async (req, res, next) => {
  try {
    const document = req.body as EvidenceDocument;
    if (!document?.id || !document?.type || !document?.values) {
      return res.status(400).json({ ok: false, error: "Invalid evidence document." });
    }
    await saveEvidenceDocument(document);
    res.json({ ok: true, document });
  } catch (error) {
    next(error);
  }
});
