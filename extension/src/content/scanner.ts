import type { FieldModel, PageModel, SectionModel } from "@gov-form-copilot/shared";
import { toFieldModel } from "./fields";
import { getMainHeading } from "./sections";

export function scanPage(): PageModel {
  const fields = getScannableFields();
  const sections = groupFieldsIntoSections(fields);

  return {
    url: window.location.href,
    title: document.title || getMainHeading() || "Untitled page",
    scannedAt: new Date().toISOString(),
    sections
  };
}

function getScannableFields(): FieldModel[] {
  const controls = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea"
    )
  );

  return controls
    .filter((el) => isCandidateField(el))
    .map((el, index) => toFieldModel(el, index));
}

function isCandidateField(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): boolean {
  const type = (el.getAttribute("type") || "").toLowerCase();
  if (["hidden", "submit", "button", "reset", "image"].includes(type)) return false;
  if (el.hasAttribute("disabled")) return false;
  return true;
}

function groupFieldsIntoSections(fields: FieldModel[]): SectionModel[] {
  const sectionsByTitle = new Map<string, SectionModel>();

  for (const field of fields) {
    const title = field.section || "Page fields";
    if (!sectionsByTitle.has(title)) {
      sectionsByTitle.set(title, { title, fields: [] });
    }
    sectionsByTitle.get(title)!.fields.push(field);
  }

  return Array.from(sectionsByTitle.values());
}
