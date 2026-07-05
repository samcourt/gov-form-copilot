import type { EvidenceDocument } from "../api/client";
import { EvidenceDocumentCard } from "../components/EvidenceDocumentCard";

interface EvidencePageProps {
  evidenceDocuments: EvidenceDocument[];
}

export function EvidencePage({ evidenceDocuments }: EvidencePageProps) {
  return (
    <section className="page-grid">
      <div className="hero">
        <h2>Evidence</h2>
        <p>Review the evidence documents currently available to the profile builder.</p>
      </div>

      <section className="card-list">
        {evidenceDocuments.map((document) => (
          <EvidenceDocumentCard key={document.id} document={document} />
        ))}

        {evidenceDocuments.length === 0 && (
          <section className="card">
            <h3>No evidence yet</h3>
            <p>Go to Upload to add extracted text or structured values.</p>
          </section>
        )}
      </section>
    </section>
  );
}
