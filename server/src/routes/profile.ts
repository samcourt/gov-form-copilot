import { Router } from "express";
import { loadEvidenceDocuments } from "../evidence/evidenceStore.js";
import { buildProfile } from "../evidence/profileBuilder.js";

export const profileRouter = Router();

profileRouter.get("/profile", async (_req, res, next) => {
  try {
    const evidenceDocuments = await loadEvidenceDocuments();
    const result = buildProfile(evidenceDocuments);
    res.json({ ok: true, ...result, evidenceDocuments });
  } catch (error) {
    next(error);
  }
});
