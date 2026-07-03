export interface SuggestionEvidence {
  source: string;
  confidence?: number;
  profilePath?: string;
  reason?: string;
}

export interface FieldSuggestion {
  fieldId: string;
  value: string;
  confidence: number;
  source: string;
  reason: string;
  evidence?: SuggestionEvidence[];
}
