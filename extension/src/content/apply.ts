import { COPILOT_ID_ATTR, getFieldType } from "./fields";
import { getLabel } from "./labels";
import { isSafeToFill } from "./safety";

export interface ApplyResult {
  ok: boolean;
  error?: string;
}

export function applyValue(fieldId: string, value: string): ApplyResult {
  const el = document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    `[${COPILOT_ID_ATTR}="${CSS.escape(fieldId)}"]`
  );

  if (!el) return { ok: false, error: "Field not found" };

  const fieldType = getFieldType(el);
  const label = getLabel(el);

  if (!isSafeToFill(el, label, fieldType)) {
    return { ok: false, error: "Field is not safe to fill automatically" };
  }

  el.focus();

  if (el instanceof HTMLSelectElement) {
    setSelectValue(el, value);
  } else if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
    setCheckableValue(el, value);
  } else {
    setNativeValue(el, value);
    fireInputEvents(el);
  }

  el.blur();

  return { ok: true };
}

function setSelectValue(el: HTMLSelectElement, value: string): void {
  const matchingOption = Array.from(el.options).find((option) => {
    return option.value === value || option.text.trim().toLowerCase() === value.trim().toLowerCase();
  });

  setNativeValue(el, matchingOption?.value ?? value);
  fireInputEvents(el);
}

function setCheckableValue(el: HTMLInputElement, value: string): void {
  const desired = value === "checked" || value === "true" || value === "yes";
  if (!desired) return;

  const label = el.closest("label") as HTMLLabelElement | null;
  const span = label?.querySelector("span") as HTMLElement | null;

  // Try the Vue/custom component path first.
  if (!el.checked && span) {
    span.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    span.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
    span.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }

  if (!el.checked && label) {
    label.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    label.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
    label.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }

  if (!el.checked) {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }

  // Final fallback: set the native state for simpler forms.
  if (!el.checked) {
    const prototype = Object.getPrototypeOf(el);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "checked");
    descriptor?.set?.call(el, desired);

    //if (el.checked !== desired) el.checked = desired;
	el.checked = desired;
  }

  fireInputEvents(el);
}

function findClickableControl(el: HTMLInputElement): HTMLElement {
  const explicitLabel = el.id
    ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(el.id)}"]`)
    : null;

  const wrappingLabel = el.closest("label") as HTMLElement | null;

  const customControl =
    el.closest<HTMLElement>("[role='checkbox'], [role='radio']") ??
    el.parentElement?.querySelector<HTMLElement>(
      "[role='checkbox'], [role='radio'], .checkbox, .radio, [class*='checkbox'], [class*='radio']"
    ) ??
    null;

  return explicitLabel ?? wrappingLabel ?? customControl ?? el;
}

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): void {
  const prototype = Object.getPrototypeOf(el);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(el, value);

  if (el.value !== value) {
    el.value = value;
  }
}

function fireInputEvents(el: HTMLElement): void {
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}
