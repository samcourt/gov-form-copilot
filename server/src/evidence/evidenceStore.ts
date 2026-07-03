import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { EvidenceDocument } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const evidenceDir = path.resolve(__dirname, "../../data/evidence");

export async function loadEvidenceDocuments(): Promise<EvidenceDocument[]> {
  const entries = await fs.readdir(evidenceDir, { withFileTypes: true }).catch(() => []);
  const jsonFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(evidenceDir, entry.name));

  return Promise.all(
    jsonFiles.map(async (filePath) => {
      const raw = await fs.readFile(filePath, "utf-8");
      return JSON.parse(raw) as EvidenceDocument;
    })
  );
}
