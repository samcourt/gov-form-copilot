export type FieldKind =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "select"
  | "textarea"
  | "checkbox"
  | "radio"
  | "file"
  | "password"
  | "hidden"
  | "submit"
  | "button"
  | "unknown";

export interface PageField {
  fieldId: string;
  label: string;
  name?: string;
  section?: string;
  tagName: string;
  type: FieldKind;
  required: boolean;
  visible: boolean;
  safeToFill: boolean;
  value?: string;
  options?: Array<{ label: string; value: string }>;
  helpText?: string;
}

export interface PageModel {
  url: string;
  title: string;
  headings: string[];
  fields: PageField[];
  buttons: Array<{ text: string; type?: string }>;
}

export interface EvidenceRef {
  source: string;
  confidence: number;
  profilePath?: string;
  reason?: string;
}

export interface FieldSuggestion {
  fieldId: string;
  value: string;
  confidence: number;
  source: string;
  profilePath?: string;
  reason: string;
}

export interface SuggestionsRequest {
  page: PageModel;
}

export interface SuggestionsResponse {
  ok: boolean;
  suggestions: Record<string, FieldSuggestion>;
  error?: string;
}
