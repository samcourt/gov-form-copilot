import type { FieldModel, FieldOption, FieldSuggestion, PageModel, ProfileField } from "@gov-form-copilot/shared";
import { matchField } from "../matchers/matcherPipeline.js";

interface SuggestAnswersInput {
  fields?: FieldModel[];
  pageModel?: PageModel;
  profile: Record<string, unknown>;
}

export function suggestAnswers(input: SuggestAnswersInput): Record<string, FieldSuggestion> {
  const fields = input.fields ?? flattenPageFields(input.pageModel);
  const suggestions: Record<string, FieldSuggestion> = {};

  for (const field of fields) {
    if (!field.safeToFill) continue;
    const match = matchField(field);
    if (!match) continue;

    const profileField = getPath(input.profile, match.profilePath) as ProfileField | undefined;
    const rawValue = profileField?.value;
    if (rawValue == null || rawValue === "") continue;

    const formatted = formatValue(String(rawValue), field, match.profilePath);
    if (!formatted) continue;

    const evidenceConfidence = profileField?.confidence ?? 0.75;
    const source = profileField?.evidence?.[0]?.sourceLabel ?? "Profile";

    suggestions[field.fieldId] = {
      fieldId: field.fieldId,
      value: formatted,
      confidence: Number((evidenceConfidence * match.confidence).toFixed(3)),
      source,
      reason: match.reason,
      evidence: [
        ...(profileField?.evidence ?? []).map((item) => ({
          source: item.sourceLabel,
          confidence: item.confidence,
          profilePath: match.profilePath,
          reason: `Evidence from ${item.sourceLabel}`
        })),
        { source: "Form scanner", confidence: match.confidence, profilePath: match.profilePath, reason: match.reason }
      ]
    };
  }

  return suggestions;
}

function flattenPageFields(pageModel?: PageModel): FieldModel[] {
  if (!pageModel) return [];
  return pageModel.sections.flatMap((section) => section.fields.map((field) => ({ ...field, section: field.section ?? section.title })));
}

function getPath(obj: Record<string, unknown>, dottedPath: string): unknown {
  return dottedPath.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function formatValue(value: string, field: FieldModel, profilePath: string): string | null {
  if (profilePath === "student.dateOfBirth") return formatDateValue(value, field);
  if (field.fieldType === "checkbox" || field.fieldType === "radio") return formatOptionValue(value, field);
  if (field.fieldType === "select") return chooseOptionValue(field.options, [value]);
  return value;
}

function formatOptionValue(value: string, field: FieldModel): string | null {
  const optionText = `${field.optionLabel ?? ""} ${field.label ?? ""} ${field.title ?? ""}`.toLowerCase();
  const valueText = value.toLowerCase();
  if (optionText.includes(valueText)) return "checked";
  if (["no", "false"].includes(valueText)) return "checked";
  if (["no", "false"].includes(valueText) && /^no\b/.test(optionText)) return "checked";
  if (["yes", "true"].includes(valueText) && /^yes\b/.test(optionText)) return "checked";
  return null;
}

function formatDateValue(value: string, field: FieldModel): string {
  const parts = parseIsoDate(value);
  if (!parts) return value;
  const role = inferDatePart(field);
  if (role === "day") return chooseOptionValue(field.options, [parts.day, String(Number(parts.day))]);
  if (role === "month") return chooseOptionValue(field.options, [parts.month, String(Number(parts.month)), parts.monthName, parts.monthShort]);
  if (role === "year") return chooseOptionValue(field.options, [parts.year]);
  return `${parts.day}/${parts.month}/${parts.year}`;
}

function parseIsoDate(value: string): { year: string; month: string; day: string; monthName: string; monthShort: string } | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return {
    year, month, day,
    monthName: new Intl.DateTimeFormat("en-AU", { month: "long", timeZone: "UTC" }).format(date),
    monthShort: new Intl.DateTimeFormat("en-AU", { month: "short", timeZone: "UTC" }).format(date)
  };
}

function inferDatePart(field: FieldModel): "day" | "month" | "year" | null {
  const text = [field.title, field.label, field.name, field.fieldId, field.placeholder].filter(Boolean).join(" ").toLowerCase();
  if (/\bday\b/.test(text)) return "day";
  if (/\bmonth\b/.test(text)) return "month";
  if (/\byear\b/.test(text)) return "year";
  return null;
}

function chooseOptionValue(options: FieldOption[], candidates: string[]): string {
  const normalisedCandidates = candidates.map(normalise);
  for (const candidate of candidates) {
    const direct = options.find((option) => option.value === candidate);
    if (direct) return direct.value;
  }
  for (const option of options) {
    if (normalisedCandidates.includes(normalise(option.label)) || normalisedCandidates.includes(normalise(option.value))) return option.value;
  }
  return candidates[0];
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
