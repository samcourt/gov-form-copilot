interface ScannerSummaryProps {
  fieldCount: number;
  matchedCount: number;
  safeCount: number;
  blockedCount: number;
}

export function ScannerSummary({
  fieldCount,
  matchedCount,
  safeCount,
  blockedCount
}: ScannerSummaryProps) {
  return (
    <section className="scanner-summary">
      <div>
        <strong>{fieldCount}</strong>
        <span>fields</span>
      </div>
      <div>
        <strong>{matchedCount}</strong>
        <span>suggestions</span>
      </div>
      <div>
        <strong>{safeCount}</strong>
        <span>safe</span>
      </div>
      <div>
        <strong>{blockedCount}</strong>
        <span>blocked</span>
      </div>
    </section>
  );
}
