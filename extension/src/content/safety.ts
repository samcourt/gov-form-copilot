import type { FieldType } from "@gov-form-copilot/shared";

export function isSafeToFill(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  label: string,
  fieldType: FieldType,
  groupLabel?: string
): boolean {
  const text = `${label} ${groupLabel ?? ""} ${el.name || ""} ${el.id || ""}`.toLowerCase();

  if (fieldType === "file") return false;

  if (fieldType === "checkbox" || fieldType === "radio") {
    return isSafeOptionGroup(text);
  }

  const unsafeTerms = [
    "password",
    "captcha",
    "signature",
    "declaration",
    "declare",
    "consent",
    "agree",
    "payment",
    "card number",
    "submit",
    "mfa",
    "verification code",
    "one time code",
    "security code",
    "cvv"
  ];

  return !unsafeTerms.some((term) => text.includes(term));
}

function isSafeOptionGroup(text: string): boolean {
  const unsafeTerms = [
    "declaration",
    "declare",
    "consent",
    "agree",
    "terms",
    "privacy",
    "payment",
    "signature"
  ];

  if (unsafeTerms.some((term) => text.includes(term))) return false;

  const safeTerms = [
    "gender",
    "sex",
    "attended another school",
    "aboriginal",
    "torres strait",
    "language other than english",
    "speak a language",
    "yes",
    "no"
  ];

  return safeTerms.some((term) => text.includes(term));
}
