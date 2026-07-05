import type { SuggestionEvidence } from "@gov-form-copilot/shared";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface EvidencePanelProps {
  evidence?: SuggestionEvidence[];
  reason: string;
}

export function EvidencePanel({ evidence = [], reason }: EvidencePanelProps) {
  return (
    <details className="evidence-panel">
      <summary>Why?</summary>

      <div className="reasoning-block">
        <div className="reasoning-label">Decision reason</div>
        <p>{reason}</p>
      </div>

      {evidence.length > 0 ? (
        <div className="evidence-list">
          {evidence.map((item, index) => (
            <div className="evidence-item" key={`${item.source}-${index}`}>
              <div className="evidence-heading">
                <span className="evidence-source">📄 {item.source}</span>
                <ConfidenceBadge confidence={item.confidence} />
              </div>

              {item.profilePath && (
                <div className="evidence-meta">
                  <span>Profile path</span>
                  <code>{item.profilePath}</code>
                </div>
              )}

              {item.reason && <p className="evidence-reason">{item.reason}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No evidence details returned.</p>
      )}
    </details>
  );
}
