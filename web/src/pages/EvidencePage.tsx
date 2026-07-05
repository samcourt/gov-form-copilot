import type { EvidenceAsset, EvidenceDocument } from "../api/client";
import { EvidenceAssetCard } from "../components/EvidenceAssetCard";
import { EvidenceDocumentCard } from "../components/EvidenceDocumentCard";

interface EvidencePageProps {
  assets: EvidenceAsset[];
  evidenceDocuments: EvidenceDocument[];
  onChanged: () => void;
}

export function EvidencePage({ assets, evidenceDocuments, onChanged }: EvidencePageProps) {
  return (
    <section className="page-grid">
      <div className="hero"><h2>Evidence Library</h2><p>Review uploaded source files and extracted evidence documents.</p></div>
      <section className="card-list">
        <h2>Uploaded assets</h2>
        {assets.map((asset) => <EvidenceAssetCard key={asset.id} asset={asset} onChanged={onChanged} />)}
        {assets.length === 0 && <section className="card"><h3>No uploaded files yet</h3><p>Go to Upload to add PDFs or images.</p></section>}
      </section>
      <section className="card-list">
        <h2>Extracted evidence documents</h2>
        {evidenceDocuments.map((document) => <EvidenceDocumentCard key={document.id} document={document} />)}
        {evidenceDocuments.length === 0 && <section className="card"><h3>No structured evidence yet</h3><p>Use extracted text or structured values to create Evidence Documents.</p></section>}
      </section>
    </section>
  );
}
