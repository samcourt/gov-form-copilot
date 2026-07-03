import { Router } from "express";
import type { EvidenceMap, SuggestionsRequest, SuggestionsResponse } from "@gov-form-copilot/shared";
import { suggestAnswers } from "../pipelines/suggestAnswers.js";
import profile from "../../data/profile.json" with { type: "json" };
import evidence from "../../data/evidence.json" with { type: "json" };

export const suggestionsRouter = Router();

suggestionsRouter.post("/suggestions", (req, res) => {
  const body = req.body as SuggestionsRequest;

  const suggestions = suggestAnswers({
    fields: body.fields,
    pageModel: body.pageModel,
    profile: profile as Record<string, unknown>,
    evidence: evidence as unknown as EvidenceMap
  });

  const response: SuggestionsResponse = { suggestions };
  res.json(response);
});