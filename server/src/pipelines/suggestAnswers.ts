import type { EvidenceRef, FieldSuggestion, PageField, PageModel } from "@gov-form-copilot/shared";
import { matchField } from "../matchers/fieldMatcher.js";
import { getPath, loadJson } from "../services/evidenceStore.js";

type Profile = Record<string, unknown>;
type EvidenceMap = Record<string, EvidenceRef>;

export async function suggestAnswers(page: PageModel): Promise<Record<string, FieldSuggestion>> {
  const profile = await loadJson<Profile>("data/profile.json");
  const evidence = await loadJson<EvidenceMap>("data/evidence.json");
  const suggestions: Record<string, FieldSuggestion> = {};

  for (const field of page.fields) {
    if (!field.safeToFill) continue;

    const match = matchField(field);
    if (!match) continue;

    const rawValue = getPath(profile, match.path);
    if (rawValue == null || rawValue === "") continue;

    const ev = evidence[match.path] ?? { source: "Profile", confidence: 0.75 };

    suggestions[field.fieldId] = {
      fieldId: field.fieldId,
      value: formatValue(String(rawValue), field),
      confidence: ev.confidence,
      source: ev.source,
      profilePath: match.path,
      reason: `Matched field text to "${match.matchedTerm}".`
    };
  }

  return suggestions;
}

function formatValue(value: string, field: PageField): string {
  const label = `${field.label} ${field.name ?? ""}`.toLowerCase();

  if (label.includes("date") || label.includes("birth")) {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  }

  return value;
}
