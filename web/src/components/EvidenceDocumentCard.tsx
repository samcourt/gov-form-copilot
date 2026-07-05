import type { EvidenceDocument } from "../api/client";

interface EvidenceDocumentCardProps {
  document: EvidenceDocument;
}

export function EvidenceDocumentCard({ document }: EvidenceDocumentCardProps) {
  const values = Object.entries(document.values ?? {});

  return (
    <article className="card evidence-card">
      <div className="card-header">
        <div>
          <h3>{document.label}</h3>
          <p>{document.type}</p>
        </div>
        <span className="pill">{values.length} facts</span>
      </div>

      <div className="meta-grid">
        <span>ID</span>
        <code>{document.id}</code>
      </div>

      <div className="value-list">
        {values.map(([path, value]) => (
          <div className="value-row" key={path}>
            <code>{path}</code>
            <strong>{String(value.value)}</strong>
            <span>{Math.round(value.confidence * 100)}%</span>
          </div>
        ))}
      </div>
    </article>
  );
}
