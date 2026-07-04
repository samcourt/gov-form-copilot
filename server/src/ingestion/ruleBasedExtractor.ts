import type { EvidenceDocument, EvidenceSourceType } from "@gov-form-copilot/shared";
import { createEvidenceDocumentFromValues } from "./evidenceFactory.js";

export function extractEvidenceFromText(args: {
  sourceType: EvidenceSourceType;
  label: string;
  rawText: string;
}): EvidenceDocument {
  const values: Record<string, string> = {};

  if (args.sourceType === "birth_certificate") {
    assignIfFound(values, "student.givenName", args.rawText, [
      /given names?\s*[:\-]\s*([A-Za-z][A-Za-z\s'-]+)/i,
      /first names?\s*[:\-]\s*([A-Za-z][A-Za-z\s'-]+)/i
    ]);

    assignIfFound(values, "student.familyName", args.rawText, [
      /family name\s*[:\-]\s*([A-Za-z][A-Za-z\s'-]+)/i,
      /surname\s*[:\-]\s*([A-Za-z][A-Za-z\s'-]+)/i
    ]);

    assignIfFound(values, "student.dateOfBirth", args.rawText, [
      /date of birth\s*[:\-]\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
      /dob\s*[:\-]\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
    ], normaliseAustralianDate);

    assignIfFound(values, "student.countryOfBirth", args.rawText, [
      /country of birth\s*[:\-]\s*([A-Za-z][A-Za-z\s'-]+)/i,
      /place of birth\s*[:\-]\s*([A-Za-z][A-Za-z\s'-]+)/i
    ]);
  }

  if (args.sourceType === "utility_bill") {
    assignIfFound(values, "address.fullAddress", args.rawText, [
      /service address\s*[:\-]\s*(.+)/i,
      /supply address\s*[:\-]\s*(.+)/i,
      /address\s*[:\-]\s*(.+)/i
    ]);

    const postcodeMatch = args.rawText.match(/\b(NSW|VIC|QLD|SA|WA|TAS|ACT|NT)\s+(\d{4})\b/i);
    if (postcodeMatch) {
      values["address.state"] = postcodeMatch[1].toUpperCase();
      values["address.postcode"] = postcodeMatch[2];
    }

    const addressMatch = args.rawText.match(/(\d+\s+[A-Za-z0-9\s'-]+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Place|Pl|Drive|Dr))/i);
    if (addressMatch) values["address.line1"] = clean(addressMatch[1]);
  }

  return createEvidenceDocumentFromValues({
    type: args.sourceType,
    label: args.label,
    values,
    confidence: 0.7,
    rawText: args.rawText
  });
}

function assignIfFound(
  target: Record<string, string>,
  path: string,
  text: string,
  patterns: RegExp[],
  transform: (value: string) => string = clean
): void {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      target[path] = transform(match[1]);
      return;
    }
  }
}

function normaliseAustralianDate(value: string): string {
  const match = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!match) return clean(value);

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim().replace(/[.,;:]$/, "");
}
