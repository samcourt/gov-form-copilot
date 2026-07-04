import type { FieldModel, FieldOption, FieldType } from "@gov-form-copilot/shared";
import { getHelpText, getLabel, getValidationText } from "./labels";
import { getSectionHeading } from "./sections";
import { isSafeToFill } from "./safety";

export const COPILOT_ID_ATTR = "data-gov-copilot-id";

export function toFieldModel(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  index: number
): FieldModel {
  const fieldId = getOrCreateFieldId(el, index);
  const fieldType = getFieldType(el);
  const title = el.getAttribute("title") || undefined;
  const optionLabel = getOptionLabel(el);
  const groupLabel = getGroupLabel(el);

  const label = fieldType === "checkbox" || fieldType === "radio"
    ? optionLabel || getLabel(el)
    : getLabel(el);

  return {
    fieldId,
    label,
    name: el.name || undefined,
    title,
    fieldType,
    required: isRequired(el),
    visible: isVisible(el),
    currentValue: getCurrentValue(el),
    placeholder: "placeholder" in el ? el.placeholder || undefined : undefined,
    helpText: getHelpText(el),
    validation: getValidationText(el),
    options: getOptions(el),
    safeToFill: isSafeToFill(el, label, fieldType, groupLabel),
    section: getSectionHeading(el),
    optionLabel,
    groupLabel
  };
}

export function getOrCreateFieldId(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  index: number
): string {
  const existingId = el.getAttribute(COPILOT_ID_ATTR);
  const title = el.getAttribute("title")?.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const fieldId = existingId || el.id || el.name || title || `field_${index}`;
  el.setAttribute(COPILOT_ID_ATTR, fieldId);
  return fieldId;
}

export function getFieldType(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): FieldType {
  if (el instanceof HTMLTextAreaElement) return "textarea";
  if (el instanceof HTMLSelectElement) return "select";

  const type = (el.getAttribute("type") || "text").toLowerCase();

  if (type === "date") return "date";
  if (type === "checkbox") return "checkbox";
  if (type === "radio") return "radio";
  if (type === "file") return "file";
  if (["text", "email", "tel", "number", "search"].includes(type)) return "text";

  return "unknown";
}

export function getCurrentValue(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): string {
  if (el instanceof HTMLInputElement && el.type === "checkbox") {
    return el.checked ? "checked" : "";
  }

  if (el instanceof HTMLInputElement && el.type === "radio") {
    return el.checked ? el.value : "";
  }

  return el.value || "";
}

export function getOptions(el: HTMLElement): FieldOption[] {
  if (el instanceof HTMLSelectElement) {
    return Array.from(el.options).map((option) => ({
      label: clean(option.text),
      value: option.value
    }));
  }

  if (el instanceof HTMLInputElement && el.type === "radio" && el.name) {
    return Array.from(
      document.querySelectorAll<HTMLInputElement>(
        `input[type="radio"][name="${CSS.escape(el.name)}"]`
      )
    ).map((radio) => ({
      label: getOptionLabel(radio) || getLabel(radio),
      value: radio.value
    }));
  }

  return [];
}

export function isRequired(el: HTMLElement): boolean {
  if (el.hasAttribute("required")) return true;
  if (el.getAttribute("aria-required") === "true") return true;
  if (el.closest("[aria-required='true']")) return true;

  const label = `${getLabel(el)} ${getGroupLabel(el) ?? ""}`.toLowerCase();

  return label.includes("*") || label.includes("required");
}

export function isVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.visibility !== "hidden" &&
    style.display !== "none"
  );
}

function getOptionLabel(el: HTMLElement): string | undefined {
  const explicit = getLabel(el);
  const title = el.getAttribute("title");
  const aria = el.getAttribute("aria-label");

  const raw = explicit || title || aria || "";
  const group = getGroupLabel(el);

  if (!raw) return undefined;

  // Remove repeated group text from custom checkbox labels when possible.
  if (group && raw.toLowerCase().includes(group.toLowerCase())) {
    const cleaned = raw.replace(new RegExp(escapeRegExp(group), "i"), "").trim();
    if (cleaned) return clean(cleaned);
  }

  return clean(raw);
}

function getGroupLabel(el: HTMLElement): string | undefined {
  const fieldset = el.closest("fieldset");
  const legend = fieldset?.querySelector<HTMLElement>("legend");
  if (legend?.innerText.trim()) return clean(legend.innerText);

  const ariaDescribedBy = el.getAttribute("aria-describedby");
  if (ariaDescribedBy) {
    const described = ariaDescribedBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.innerText)
      .filter(Boolean)
      .join(" ");

    if (looksLikeGroupLabel(described)) return clean(described);
  }

  const parent = el.closest("div, section, form");
  const nearbyHeading = parent?.querySelector<HTMLElement>("h1,h2,h3,h4,h5,h6,[role='heading']");
  if (nearbyHeading?.innerText.trim()) return clean(nearbyHeading.innerText);

  const title = el.getAttribute("title");
  if (title && looksLikeGroupLabel(title)) return clean(title);

  return undefined;
}

function looksLikeGroupLabel(text = ""): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("gender") ||
    t.includes("aboriginal") ||
    t.includes("torres strait") ||
    t.includes("language") ||
    t.includes("attended another school") ||
    t.includes("date of birth") ||
    t.includes("country of birth")
  );
}

function clean(text: string): string {
  return String(text).replace(/\s+/g, " ").replace(/\*/g, "").trim();
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
