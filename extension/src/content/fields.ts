import type {
  FieldModel,
  FieldOption,
  FieldType,
  FormEntityType
} from "@gov-form-copilot/shared";
import { getHelpText, getLabel, getValidationText } from "./labels";
import { getSectionHeading } from "./sections";
import { isSafeToFill } from "./safety";

export const COPILOT_ID_ATTR = "data-gov-copilot-id";

interface BindingMetadata {
  bindingPath?: string;
  entityType: FormEntityType;
  entityIndex?: number;
  bindingProperty?: string;
  logicalFieldId: string;
}

export function toFieldModel(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  index: number
): FieldModel {
  const fieldId = getOrCreateFieldId(el, index);
  const fieldType = getFieldType(el);
  const title = el.getAttribute("title") || undefined;
  const optionLabel = getOptionLabel(el);
  const groupLabel = getGroupLabel(el);

  const label =
    fieldType === "checkbox" || fieldType === "radio"
      ? optionLabel || getLabel(el)
      : getLabel(el);

  const binding = inferBindingMetadata(
    el,
    fieldId,
    fieldType,
    label,
    groupLabel
  );

  return {
    fieldId,
    label,
    name: el.name || undefined,
    title,
    fieldType,
    required: isRequired(el),
    visible: isVisible(el),
    currentValue: getCurrentValue(el),
    placeholder:
      "placeholder" in el
        ? el.placeholder || undefined
        : undefined,
    helpText: getHelpText(el),
    validation: getValidationText(el),
    options: getOptions(el),
    safeToFill: isSafeToFill(
      el,
      label,
      fieldType,
      groupLabel
    ),
    section: getSectionHeading(el),
    optionLabel,
    groupLabel,
    bindingPath: binding.bindingPath,
    entityType: binding.entityType,
    entityIndex: binding.entityIndex,
    bindingProperty: binding.bindingProperty,
    logicalFieldId: binding.logicalFieldId
  };
}

export function getOrCreateFieldId(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  index: number
): string {
  const existingId = el.getAttribute(COPILOT_ID_ATTR);
  const title = el
    .getAttribute("title")
    ?.replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const fieldId =
    existingId ||
    el.id ||
    el.name ||
    title ||
    `field_${index}`;

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

  if (
    ["text", "email", "tel", "number", "search"].includes(type)
  ) {
    return "text";
  }

  return "unknown";
}

export function getCurrentValue(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): string {
  if (
    el instanceof HTMLInputElement &&
    el.type === "checkbox"
  ) {
    return el.checked ? "checked" : "";
  }

  if (
    el instanceof HTMLInputElement &&
    el.type === "radio"
  ) {
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

  if (
    el instanceof HTMLInputElement &&
    el.type === "radio" &&
    el.name
  ) {
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

  const label =
    `${getLabel(el)} ${getGroupLabel(el) ?? ""}`.toLowerCase();

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

function inferBindingMetadata(
  el: HTMLElement,
  fieldId: string,
  fieldType: FieldType,
  label?: string,
  groupLabel?: string
): BindingMetadata {
  const bindingPath = readBindingPath(el);

  const searchable = [
    bindingPath,
    el.getAttribute("name"),
    el.id,
    label,
    groupLabel,
    getSectionHeading(el)
  ]
    .filter(Boolean)
    .join(" ");

  const parentMatch = searchable.match(
    /parentCarers?\[(\d+)\](?:[.>:_-]?([a-zA-Z0-9_-]+))?/i
  );

  if (parentMatch) {
    const entityIndex = Number(parentMatch[1]);
    const bindingProperty =
      parentMatch[2] ||
      getTrailingBindingProperty(bindingPath);

    return {
      bindingPath,
      entityType: "parentCarer",
      entityIndex,
      bindingProperty,
      logicalFieldId: buildLogicalFieldId(
        el,
        fieldId,
        fieldType,
        bindingPath,
        entityIndex,
        bindingProperty,
        groupLabel
      )
    };
  }

  if (/\bstudent\b|\bchild\b/i.test(searchable)) {
    const bindingProperty =
      getTrailingBindingProperty(bindingPath);

    return {
      bindingPath,
      entityType: "student",
      bindingProperty,
      logicalFieldId: buildLogicalFieldId(
        el,
        fieldId,
        fieldType,
        bindingPath,
        undefined,
        bindingProperty,
        groupLabel
      )
    };
  }

  if (/\baddress\b|\bresidential\b/i.test(searchable)) {
    const bindingProperty =
      getTrailingBindingProperty(bindingPath);

    return {
      bindingPath,
      entityType: "address",
      bindingProperty,
      logicalFieldId: buildLogicalFieldId(
        el,
        fieldId,
        fieldType,
        bindingPath,
        undefined,
        bindingProperty,
        groupLabel
      )
    };
  }

  const bindingProperty =
    getTrailingBindingProperty(bindingPath);

  return {
    bindingPath,
    entityType: "unknown",
    bindingProperty,
    logicalFieldId: buildLogicalFieldId(
      el,
      fieldId,
      fieldType,
      bindingPath,
      undefined,
      bindingProperty,
      groupLabel
    )
  };
}

function readBindingPath(
  el: HTMLElement
): string | undefined {
  const candidates = [
    el.getAttribute("data-binding-path"),
    el.getAttribute("data-field-path"),
    el.getAttribute("formcontrolname"),
    el.getAttribute("ng-reflect-name"),
    el.getAttribute("aria-describedby"),
    el.getAttribute("name"),
    el.id
  ];

  for (const candidate of candidates) {
    const value = normaliseBindingValue(candidate);

    if (!value) continue;

    if (
      /parentCarers?\[\d+\]/i.test(value) ||
      /\bstudent\b/i.test(value) ||
      /\baddress\b/i.test(value) ||
      value.includes(">")
    ) {
      return value;
    }
  }

  return undefined;
}

function normaliseBindingValue(
  value?: string | null
): string | undefined {
  const cleaned = String(value ?? "").trim();
  return cleaned || undefined;
}

function getTrailingBindingProperty(
  bindingPath?: string
): string | undefined {
  if (!bindingPath) return undefined;

  const structuralPart =
    bindingPath
      .split(/\s+/)
      .find(
        (part) =>
          part.includes(">") ||
          part.includes(".") ||
          part.includes("[")
      ) ?? bindingPath;

  const withoutArrayIndexes =
    structuralPart.replace(/\[\d+\]/g, "");

  return withoutArrayIndexes
    .split(/[.>:]/)
    .filter(Boolean)
    .at(-1);
}

function buildLogicalFieldId(
  el: HTMLElement,
  fieldId: string,
  fieldType: FieldType,
  bindingPath?: string,
  entityIndex?: number,
  bindingProperty?: string,
  groupLabel?: string
): string {
  if (
    fieldType === "radio" ||
    fieldType === "checkbox"
  ) {
    const applicationField =
      el.closest<HTMLElement>(".ApplicationField");

    if (applicationField) {
      const structuralBinding =
        findStructuralBindingInContainer(applicationField);

      if (structuralBinding) {
        return `group:${normaliseLogicalBinding(
          structuralBinding
        )}`;
      }

      const questionLabel =
        getApplicationFieldLabel(applicationField);

      if (questionLabel) {
        return `group:${normaliseId(
          `${getSectionHeading(el) ?? ""}-${questionLabel}`
        )}`;
      }
    }

    const name = el.getAttribute("name");

    if (name) {
      return `group:${normaliseId(name)}`;
    }

    if (bindingPath) {
      return `group:${normaliseLogicalBinding(
        bindingPath
      )}`;
    }

    const fieldset = el.closest("fieldset");
    const legend =
      fieldset
        ?.querySelector("legend")
        ?.textContent
        ?.trim();

    if (legend) {
      return `group:${normaliseId(legend)}`;
    }

    if (groupLabel) {
      return `group:${normaliseId(
        `${getSectionHeading(el) ?? ""}-${groupLabel}`
      )}`;
    }
  }

  if (
    entityIndex !== undefined &&
    bindingProperty
  ) {
    return (
      `parentCarer:${entityIndex}:` +
      normaliseId(bindingProperty)
    );
  }

  if (bindingPath) {
    return `field:${normaliseLogicalBinding(
      bindingPath
    )}`;
  }

  return `field:${normaliseId(fieldId)}`;
}

function findStructuralBindingInContainer(
  container: HTMLElement
): string | undefined {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        "input",
        "select",
        "textarea",
        "[aria-describedby]",
        "[data-binding-path]",
        "[data-field-path]",
        "[formcontrolname]",
        "[ng-reflect-name]"
      ].join(",")
    )
  );

  for (const element of elements) {
    const binding = readBindingPath(element);

    if (binding) {
      return binding;
    }
  }

  return undefined;
}

function getApplicationFieldLabel(
  container: HTMLElement
): string | undefined {
  const candidates = [
    container.querySelector<HTMLElement>(
      ".v-label"
    ),
    container.querySelector<HTMLElement>(
      "[class*='label']"
    ),
    container.querySelector<HTMLElement>(
      "legend"
    ),
    container.querySelector<HTMLElement>(
      "h1,h2,h3,h4,h5,h6"
    )
  ];

  for (const candidate of candidates) {
    const text = candidate?.innerText?.trim();

    if (text) {
      return clean(text);
    }
  }

  const listbox =
    container.querySelector<HTMLElement>(
      "[role='listbox']"
    );

  const fullText = clean(
    container.innerText || ""
  );

  const optionText = clean(
    listbox?.innerText || ""
  );

  if (
    fullText &&
    optionText &&
    fullText.endsWith(optionText)
  ) {
    const questionText = clean(
      fullText.slice(
        0,
        fullText.length - optionText.length
      )
    );

    if (questionText) {
      return questionText;
    }
  }

  return undefined;
}

function normaliseLogicalBinding(
  value: string
): string {
  return normaliseId(
    value
      .replace(/\s+/g, " ")
      .replace(
        /\b(male|female|yes|no|true|false|unknown)\b$/i,
        ""
      )
  );
}

function normaliseId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9[\]]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getOptionLabel(
  el: HTMLElement
): string | undefined {
  const explicit = getLabel(el);
  const title = el.getAttribute("title");
  const aria = el.getAttribute("aria-label");

  const raw = explicit || title || aria || "";
  const group = getGroupLabel(el);

  if (!raw) return undefined;

  if (
    group &&
    raw.toLowerCase().includes(group.toLowerCase())
  ) {
    const cleaned = raw
      .replace(
        new RegExp(escapeRegExp(group), "i"),
        ""
      )
      .trim();

    if (cleaned) {
      return clean(cleaned);
    }
  }

  return clean(raw);
}

function getGroupLabel(
  el: HTMLElement
): string | undefined {
  const applicationField =
    el.closest<HTMLElement>(".ApplicationField");

  if (applicationField) {
    const applicationFieldLabel =
      getApplicationFieldLabel(applicationField);

    if (applicationFieldLabel) {
      return applicationFieldLabel;
    }
  }
  
  const fieldset = el.closest("fieldset");
  const legend =
    fieldset?.querySelector<HTMLElement>("legend");

  if (legend?.innerText.trim()) {
    return clean(legend.innerText);
  }

  const ariaDescribedBy =
    el.getAttribute("aria-describedby");

  if (ariaDescribedBy) {
    const described = ariaDescribedBy
      .split(/\s+/)
      .map(
        (id) =>
          document.getElementById(id)?.innerText
      )
      .filter(Boolean)
      .join(" ");

    if (looksLikeGroupLabel(described)) {
      return clean(described);
    }
  }

  const parent = el.closest("div, section, form");
  const nearbyHeading =
    parent?.querySelector<HTMLElement>(
      "h1,h2,h3,h4,h5,h6,[role='heading']"
    );

  if (nearbyHeading?.innerText.trim()) {
    return clean(nearbyHeading.innerText);
  }

  const title = el.getAttribute("title");

  if (title && looksLikeGroupLabel(title)) {
    return clean(title);
  }

  return undefined;
}

function looksLikeGroupLabel(text = ""): boolean {
  const value = text.toLowerCase();

  return (
    value.includes("gender") ||
    value.includes("aboriginal") ||
    value.includes("torres strait") ||
    value.includes("language") ||
    value.includes("attended another school") ||
    value.includes("date of birth") ||
    value.includes("country of birth") ||
    value.includes("parent") ||
    value.includes("carer") ||
    value.includes("guardian") ||
    value.includes("occupation") ||
    value.includes("qualification") ||
    value.includes("schooling")
  );
}

function clean(text: string): string {
  return String(text)
    .replace(/\s+/g, " ")
    .replace(/\*/g, "")
    .trim();
}

function escapeRegExp(text: string): string {
  return text.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}