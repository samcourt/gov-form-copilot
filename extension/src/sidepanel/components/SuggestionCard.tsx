import type { FieldModel, FieldSuggestion } from "@gov-form-copilot/shared";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { EvidencePanel } from "./EvidencePanel";

interface SuggestionCardProps {
  field: FieldModel;
  suggestion?: FieldSuggestion;
  onApply: () => void;
}

export function SuggestionCard({ field, suggestion, onApply }: SuggestionCardProps) {
  const title = field.label || field.name || field.fieldId;

  return (
    <article className="field-card">
      <div className="field-header">
        <div>
          <div className="field-title">{title}</div>
          <div className="field-meta">
            {field.fieldType}
            {field.required ? " · required" : ""}
            {field.section ? ` · ${field.section}` : ""}
          </div>
        </div>

        <span className={`safety-pill ${field.safeToFill ? "safe" : "blocked"}`}>
          {field.safeToFill ? "Safe" : "Blocked"}
        </span>
      </div>

      {field.helpText && <p className="help-text">{field.helpText}</p>}

      {suggestion ? (
        <div className="suggestion-card">
          <div className="suggestion-top">
            <div>
              <div className="suggestion-label">Suggested value</div>
              <div className="suggested-value">{suggestion.value}</div>
            </div>

            <ConfidenceBadge confidence={suggestion.confidence} />
          </div>

          <div className="source-line">
            <span>Source</span>
            <strong>{suggestion.source}</strong>
          </div>

          <EvidencePanel evidence={suggestion.evidence} reason={suggestion.reason} />

          <button disabled={!field.safeToFill} onClick={onApply}>
            Apply
          </button>
        </div>
      ) : (
        <div className="no-suggestion">No suggestion</div>
      )}
    </article>
  );
}
