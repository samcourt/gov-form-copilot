import type { FieldModel } from "./FieldModel.js";
import type { PageModel } from "./PageModel.js";
import type { FieldSuggestion } from "./Suggestion.js";

export interface SuggestionsRequest {
  fields?: FieldModel[];
  pageModel?: PageModel;
}

export interface SuggestionsResponse {
  suggestions: Record<string, FieldSuggestion>;
}
