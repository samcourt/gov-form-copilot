import type { EvidenceMap, FieldModel, FieldSuggestion, PageModel } from "@gov-form-copilot/shared";
import { matchField } from "../matchers/fieldMatcher.js";

interface SuggestAnswersInput {
  fields?: FieldModel[];
  pageModel?: PageModel;
  profile: Record<string, unknown>;
  evidence: EvidenceMap;
}

export function suggestAnswers(input: SuggestAnswersInput): Record<string, FieldSuggestion> {
  const fields = input.fields ?? flattenPageFields(input.pageModel);
  const suggestions: Record<string, FieldSuggestion> = {};

  for (const field of fields) {
    if (!field.safeToFill) continue;

    const match = matchField(field);
    if (!match) continue;

    const rawValue = getPath(input.profile, match.profilePath);
    if (rawValue == null || rawValue === "") continue;

    const evidenceItem = input.evidence[match.profilePath] ?? {
      source: "Profile",
      confidence: 0.75,
      value: String(rawValue)
    };

    suggestions[field.fieldId] = {
      fieldId: field.fieldId,
      value: formatValue(String(rawValue), field),
      confidence: evidenceItem.confidence,
      source: evidenceItem.source,
      reason: `Matched field text to "${match.matchedTerm}".`,
      evidence: [
        {
          source: evidenceItem.source,
          confidence: evidenceItem.confidence,
          profilePath: match.profilePath,
          reason: `Profile path ${match.profilePath}`
        }
      ]
    };
  }

  return suggestions;
}

function flattenPageFields(pageModel?: PageModel): FieldModel[] {
  if (!pageModel) return [];
  return pageModel.sections.flatMap((section) =>
    section.fields.map((field) => ({
      ...field,
      section: field.section ?? section.title
    }))
  );
}

function getPath(obj: Record<string, unknown>, dottedPath: string): unknown {
  return dottedPath.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function formatValue(value: string, field: FieldModel): string {
  const label = `${field.label} ${field.name ?? ""} ${field.fieldType}`.toLowerCase();
  if (label.includes("date") || label.includes("birth")) {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return value;
}
