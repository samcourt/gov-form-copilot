import type { EvidenceAsset, EvidenceDocument, ProfileResponse } from "../api/client";

interface DashboardProps {
  assets: EvidenceAsset[];
  evidenceDocuments: EvidenceDocument[];
  profile: ProfileResponse | null;
}

export function Dashboard({ assets, evidenceDocuments, profile }: DashboardProps) {
  return (
    <section className="page-grid">
      <div className="hero">
        <h2>Profile & Evidence Portal</h2>
        <p>Upload evidence assets, review extracted facts, resolve conflicts, and inspect the canonical profile used by the browser extension.</p>
      </div>
      <section className="stats-grid">
        <div className="stat-card"><strong>{assets.length}</strong><span>Uploaded assets</span></div>
        <div className="stat-card"><strong>{evidenceDocuments.length}</strong><span>Evidence documents</span></div>
        <div className="stat-card"><strong>{profile?.conflicts ?? 0}</strong><span>Conflicts</span></div>
      </section>
      <section className="card">
        <h3>Evidence Library</h3>
        <p>Uploaded files are Evidence Assets. Extracted structured facts are Evidence Documents. The Canonical Profile is derived from those facts.</p>
      </section>
    </section>
  );
}
