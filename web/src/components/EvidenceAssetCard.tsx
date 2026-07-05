import { assetFileUrl, deleteAsset, type EvidenceAsset } from "../api/client";

interface EvidenceAssetCardProps {
  asset: EvidenceAsset;
  onChanged: () => void;
}

export function EvidenceAssetCard({ asset, onChanged }: EvidenceAssetCardProps) {
  async function handleDelete() {
    if (!window.confirm(`Delete ${asset.originalFilename}?`)) return;
    await deleteAsset(asset.id);
    await onChanged();
  }

  return (
    <article className="card evidence-card">
      <div className="card-header">
        <div>
          <h3>{asset.label || asset.originalFilename}</h3>
          <p>{asset.originalFilename}</p>
        </div>
        <span className="pill">{asset.status}</span>
      </div>

      <div className="meta-grid">
        <span>Type</span><strong>{asset.sourceType || "unknown"}</strong>
        <span>File</span><code>{asset.mimeType} · {Math.round(asset.size / 1024)} KB</code>
        <span>Uploaded</span><strong>{new Date(asset.uploadedAt).toLocaleString()}</strong>
      </div>

      <div className="button-row">
        <a className="button-link" href={assetFileUrl(asset.id)} target="_blank" rel="noreferrer">View</a>
        <button className="secondary" onClick={handleDelete}>Delete</button>
      </div>
    </article>
  );
}
