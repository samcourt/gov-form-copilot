export function getLabel(el: HTMLElement): string {
  const title = el.getAttribute("title");
  if (title) return clean(title);

  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) return clean(ariaLabel);

  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((labelId) => document.getElementById(labelId)?.innerText)
      .filter(Boolean)
      .join(" ");

    if (text.trim()) return clean(text);
  }

  const id = el.getAttribute("id");

  if (id) {
    const explicit = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`);
    if (explicit?.innerText.trim()) return cleanLabelWithoutOptions(explicit, el);
  }

  const wrappingLabel = el.closest("label");
  if (wrappingLabel?.innerText.trim()) return cleanLabelWithoutOptions(wrappingLabel, el);

  const nearbyText = findNearbyLabelText(el);
  if (nearbyText) return clean(nearbyText);

  return clean(el.getAttribute("name") || el.getAttribute("placeholder") || "");
}

export function getHelpText(el: HTMLElement): string | undefined {
  const describedBy = el.getAttribute("aria-describedby");

  if (describedBy) {
    const text = describedBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.innerText)
      .filter(Boolean)
      .join(" ");

    if (text.trim()) return clean(text);
  }

  const parent = el.closest("div, fieldset, section, form");
  const help = parent?.querySelector<HTMLElement>(
    ".hint, .help, .helper, .description, [class*='hint'], [class*='help'], [class*='description']"
  );

  return help?.innerText ? clean(help.innerText) : undefined;
}

export function getValidationText(el: HTMLElement): string | undefined {
  const invalid = el.getAttribute("aria-invalid");
  const validationMessage = "validationMessage" in el ? (el as HTMLInputElement).validationMessage : "";

  if (invalid === "true" && validationMessage) return clean(validationMessage);

  const parent = el.closest("div, fieldset, section, form");
  const error = parent?.querySelector<HTMLElement>(
    ".error, .validation, [role='alert'], [class*='error'], [class*='invalid']"
  );

  return error?.innerText ? clean(error.innerText) : undefined;
}

function cleanLabelWithoutOptions(labelEl: HTMLElement, control: HTMLElement): string {
  const clone = labelEl.cloneNode(true) as HTMLElement;

  clone.querySelectorAll("option").forEach((option) => option.remove());
  clone.querySelectorAll("select,input,textarea,button").forEach((node) => node.remove());

  const text = clone.innerText || clone.textContent || "";
  if (text.trim()) return clean(text);

  return clean(labelEl.innerText || labelEl.textContent || control.getAttribute("name") || "");
}

function findNearbyLabelText(el: HTMLElement): string {
  const parent = el.parentElement;
  if (!parent) return "";

  const clone = parent.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("option").forEach((option) => option.remove());
  clone.querySelectorAll("select,input,textarea,button").forEach((node) => node.remove());

  const candidates = Array.from(clone.querySelectorAll("label, span, div, p"))
    .map((node) => (node as HTMLElement).innerText?.trim())
    .filter(Boolean)
    .filter((text) => text.length > 0 && text.length < 180);

  const parentText = clone.innerText?.trim();
  if (parentText && parentText.length < 180) return parentText;

  return candidates[0] || "";
}

export function clean(text: string): string {
  return String(text).replace(/\s+/g, " ").replace(/\*/g, "").trim();
}
