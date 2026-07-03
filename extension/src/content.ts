import type { FieldKind, PageField, PageModel } from "@gov-form-copilot/shared";

type ScanMessage = { type: "SCAN_PAGE" };
type ApplyMessage = { type: "APPLY_VALUE"; fieldId: string; value: string };
type Message = ScanMessage | ApplyMessage;

console.log("Gov Form Copilot content script loaded", window.location.href);

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  if (message.type === "SCAN_PAGE") {
    sendResponse(scanPage());
    return true;
  }

  if (message.type === "APPLY_VALUE") {
    sendResponse(applyValue(message.fieldId, message.value));
    return true;
  }

  return false;
});

function scanPage(): PageModel {
  const fields = Array.from(document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"))
    .map(toPageField)
    .filter((field): field is PageField => Boolean(field));

  return {
    url: window.location.href,
    title: document.title,
    headings: Array.from(document.querySelectorAll("h1, h2, h3")).map((h) => h.textContent?.trim() ?? "").filter(Boolean),
    fields,
    buttons: Array.from(document.querySelectorAll<HTMLButtonElement | HTMLInputElement>('button, input[type="submit"], input[type="button"]')).map((button) => ({
      text: button instanceof HTMLInputElement ? button.value : button.innerText.trim(),
      type: button.getAttribute("type") ?? undefined
    }))
  };
}

function toPageField(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, index: number): PageField | null {
  const tagName = el.tagName.toLowerCase();
  const rawType = tagName === "input" ? (el as HTMLInputElement).type.toLowerCase() : tagName;
  const type = toFieldKind(rawType);
  const fieldId = el.id || el.name || `field_${index}`;

  el.dataset.govCopilotId = fieldId;

  const label = findLabel(el);
  const safeToFill = isSafeToFill(type, el);

  return {
    fieldId,
    label,
    name: el.getAttribute("name") ?? undefined,
    section: findNearestHeading(el),
    tagName,
    type,
    required: Boolean((el as HTMLInputElement).required || el.getAttribute("aria-required") === "true"),
    visible: isVisible(el),
    safeToFill,
    value: "value" in el ? el.value : undefined,
    options: el instanceof HTMLSelectElement
      ? Array.from(el.options).map((option) => ({ label: option.text, value: option.value }))
      : undefined,
    helpText: findHelpText(el)
  };
}

function toFieldKind(type: string): FieldKind {
  const allowed: FieldKind[] = ["text", "email", "tel", "date", "select", "textarea", "checkbox", "radio", "file", "password", "hidden", "submit", "button"];
  return allowed.includes(type as FieldKind) ? (type as FieldKind) : "unknown";
}

function isSafeToFill(type: FieldKind, el: Element): boolean {
  if (!["text", "email", "tel", "date", "select", "textarea", "unknown"].includes(type)) return false;
  if (!isVisible(el)) return false;
  return true;
}

function isVisible(el: Element): boolean {
  const style = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
}

function findLabel(el: HTMLElement): string {
  if (el.id) {
    const forLabel = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (forLabel?.textContent?.trim()) return cleanText(forLabel.textContent);
  }

  const wrappedLabel = el.closest("label");
  if (wrappedLabel?.textContent?.trim()) return cleanText(wrappedLabel.textContent);

  return cleanText(
    el.getAttribute("aria-label") ||
    el.getAttribute("placeholder") ||
    el.getAttribute("name") ||
    el.id ||
    ""
  );
}

function findNearestHeading(el: HTMLElement): string | undefined {
  let current: HTMLElement | null = el;
  while (current && current !== document.body) {
    const heading = current.querySelector?.("h1, h2, h3, legend");
    if (heading?.textContent?.trim()) return cleanText(heading.textContent);
    current = current.parentElement;
  }
  return undefined;
}

function findHelpText(el: HTMLElement): string | undefined {
  const describedBy = el.getAttribute("aria-describedby");
  if (!describedBy) return undefined;

  const text = describedBy
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent?.trim())
    .filter(Boolean)
    .join(" ");

  return text ? cleanText(text) : undefined;
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function applyValue(fieldId: string, value: string): { ok: boolean; error?: string } {
  const el = document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[data-gov-copilot-id="${CSS.escape(fieldId)}"]`);

  if (!el) return { ok: false, error: "Field not found" };

  const type = toFieldKind(el instanceof HTMLInputElement ? el.type.toLowerCase() : el.tagName.toLowerCase());
  if (!isSafeToFill(type, el)) return { ok: false, error: `Field type ${type} is blocked` };

  el.focus();
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return { ok: true };
}
