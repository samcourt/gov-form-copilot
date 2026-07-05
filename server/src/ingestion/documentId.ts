export function makeDocumentId(label: string): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
  return `${slug || "evidence"}-${Date.now()}`;
}
