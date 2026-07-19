import type { FieldModel } from "@gov-form-copilot/shared";

interface ScannerSummaryProps {
  fields: FieldModel[];
  matchedCount: number;
}

export function ScannerSummary({
  fields,
  matchedCount
}: ScannerSummaryProps) {
  const fieldCount = countLogicalFields(fields);

  const safeCount = countLogicalFieldsWhere(
    fields,
    (field) => field.safeToFill
  );

  const blockedCount = countLogicalFieldsWhere(
    fields,
    (field) => !field.safeToFill
  );

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

function countLogicalFields(
  fields: FieldModel[]
): number {
  return getLogicalFieldIds(fields).size;
}

function countLogicalFieldsWhere(
  fields: FieldModel[],
  predicate: (field: FieldModel) => boolean
): number {
  return getLogicalFieldIds(
    fields.filter(predicate)
  ).size;
}

function getLogicalFieldIds(
  fields: FieldModel[]
): Set<string> {
  return new Set(
    fields.map((field) =>
      field.logicalFieldId || field.fieldId
    )
  );
}