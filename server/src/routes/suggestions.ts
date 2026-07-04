import { Router } from "express";
import type { SuggestionsRequest, SuggestionsResponse } from "@gov-form-copilot/shared";
import { buildProfile } from "../evidence/profileBuilder.js";
import { loadEvidenceDocuments } from "../evidence/evidenceStore.js";
import { suggestAnswers } from "../pipelines/suggestAnswers.js";

export const suggestionsRouter = Router();

suggestionsRouter.post("/suggestions", async (req, res, next) => {
  try {
    const body = req.body as SuggestionsRequest;
    const evidenceDocuments = await loadEvidenceDocuments();
    const profileResult = buildProfile(evidenceDocuments);

    const suggestions = suggestAnswers({
      fields: body.fields,
      pageModel: body.pageModel,
      profile: profileResult.profile as unknown as Record<string, unknown>
    });

    const response: SuggestionsResponse = { suggestions };
    res.json(response);
  } catch (error) {
    next(error);
  }
});
