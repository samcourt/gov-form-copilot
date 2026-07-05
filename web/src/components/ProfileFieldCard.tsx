import type { ProfileField } from "../api/client";

interface ProfileFieldCardProps {
  field: ProfileField;
}

export function ProfileFieldCard({ field }: ProfileFieldCardProps) {
  return (
    <article className={`card profile-field ${field.status}`}>
      <div className="card-header">
        <div>
          <h3>{field.path}</h3>
          <p>{field.reason ?? "No reasoning available."}</p>
        </div>
        <span className="pill">{Math.round(field.confidence * 100)}%</span>
      </div>

      <div className="profile-value">{field.value || "—"}</div>

      {field.evidence.length > 0 && (
        <details>
          <summary>Supporting evidence</summary>
          <div className="value-list">
            {field.evidence.map((item, index) => (
              <div className="value-row" key={`${item.sourceLabel}-${index}`}>
                <strong>{item.sourceLabel}</strong>
                <span>{String(item.value)}</span>
                <span>{Math.round(item.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {field.conflicts.length > 0 && (
        <details open>
          <summary>Conflicts</summary>
          <div className="value-list conflict-list">
            {field.conflicts.map((item, index) => (
              <div className="value-row" key={`${item.sourceLabel}-${index}`}>
                <strong>{item.sourceLabel}</strong>
                <span>{String(item.value)}</span>
                <span>{Math.round(item.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </article>
  );
}
