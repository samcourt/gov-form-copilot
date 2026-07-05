interface ConfidenceBadgeProps {
  confidence?: number;
}

function getConfidenceLabel(confidence?: number): string {
  if (confidence == null) return "Unknown";
  if (confidence >= 0.9) return "High";
  if (confidence >= 0.7) return "Medium";
  return "Low";
}

function getConfidenceClass(confidence?: number): string {
  if (confidence == null) return "confidence-unknown";
  if (confidence >= 0.9) return "confidence-high";
  if (confidence >= 0.7) return "confidence-medium";
  return "confidence-low";
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const percentage = confidence == null ? "—" : `${Math.round(confidence * 100)}%`;

  return (
    <span className={`confidence-badge ${getConfidenceClass(confidence)}`}>
      <strong>{percentage}</strong>
      <span>{getConfidenceLabel(confidence)}</span>
    </span>
  );
}
