import type { EvidenceDocument, ProfileResponse } from "../api/client";

interface DashboardProps {
  evidenceDocuments: EvidenceDocument[];
  profile: ProfileResponse | null;
}

export function Dashboard({ evidenceDocuments, profile }: DashboardProps) {
  return (
    <section className="page-grid">
      <div className="hero">
        <h2>Profile & Evidence Portal</h2>
        <p>
          Upload or paste evidence, review extracted facts, resolve conflicts, and inspect the canonical profile used by the browser extension.
        </p>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <strong>{evidenceDocuments.length}</strong>
          <span>Evidence documents</span>
        </div>
        <div className="stat-card">
          <strong>{profile?.fields ?? 0}</strong>
          <span>Profile fields</span>
        </div>
        <div className="stat-card">
          <strong>{profile?.conflicts ?? 0}</strong>
          <span>Conflicts</span>
        </div>
      </section>

      <section className="card">
        <h3>Current architecture</h3>
        <p>
          Documents are converted into Evidence Documents. The Evidence Engine builds a canonical profile, and the browser extension consumes that profile when suggesting answers.
        </p>
      </section>
    </section>
  );
}
