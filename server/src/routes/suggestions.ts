import { Router } from "express";
import type { SuggestionsRequest, SuggestionsResponse } from "@gov-form-copilot/shared";
import { suggestAnswers } from "../pipelines/suggestAnswers.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const body = req.body as SuggestionsRequest;

    if (!body.page || !Array.isArray(body.page.fields)) {
      return res.status(400).json({
        ok: false,
        suggestions: {},
        error: "Request body must include page.fields"
      } satisfies SuggestionsResponse);
    }

    const suggestions = await suggestAnswers(body.page);

    res.json({ ok: true, suggestions } satisfies SuggestionsResponse);
  } catch (error) {
    console.error("Suggestion error:", error);

    res.status(500).json({
      ok: false,
      suggestions: {},
      error: error instanceof Error ? error.message : "Unknown error"
    } satisfies SuggestionsResponse);
  }
});

export default router;
