import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { EvidenceDocument } from "@gov-form-copilot/shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const evidenceDir = path.resolve(__dirname, "../../data/evidence");

export async function loadEvidenceDocuments(): Promise<EvidenceDocument[]> {
  const entries = await fs.readdir(evidenceDir, { withFileTypes: true }).catch(() => []);
  const jsonFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(evidenceDir, entry.name));

  const docs = await Promise.all(
    jsonFiles.map(async (filePath) => JSON.parse(await fs.readFile(filePath, "utf-8")) as EvidenceDocument)
  );

  return docs.sort((a, b) => a.label.localeCompare(b.label));
}

export async function saveEvidenceDocument(document: EvidenceDocument): Promise<void> {
  await fs.mkdir(evidenceDir, { recursive: true });
  await fs.writeFile(path.join(evidenceDir, `${document.id}.json`), JSON.stringify(document, null, 2), "utf-8");
}
