import { Router } from "express";
import type { CanonicalProfile } from "@gov-form-copilot/shared";
import { loadEvidenceDocuments } from "../evidence/evidenceStore.js";
import { buildProfile } from "../evidence/profileBuilder.js";

export const profileRouter = Router();

profileRouter.get("/profile", async (_req, res, next) => {
  try {
    const evidenceDocuments = await loadEvidenceDocuments();
    const profile = buildProfile(evidenceDocuments);

    res.json({
      ok: true,
      profile,
      evidenceDocuments,
      ...summariseProfile(profile, evidenceDocuments.length)
    });
  } catch (error) {
    next(error);
  }
});

function summariseProfile(profile: CanonicalProfile, documents: number) {
  const fields = flattenProfileFields(profile);

  return {
    documents,
    fields: fields.length,
    conflicts: fields.filter((field) => Array.isArray(field.conflicts) && field.conflicts.length > 0).length,
    generatedAt: new Date().toISOString()
  };
}

function flattenProfileFields(profile: CanonicalProfile): Array<{ conflicts?: unknown[] }> {
  const fields: Array<{ conflicts?: unknown[] }> = [];

  function walk(value: unknown): void {
    if (!value || typeof value !== "object") return;

    if ("confidence" in value && "evidence" in value && "conflicts" in value) {
      fields.push(value as { conflicts?: unknown[] });
      return;
    }

    for (const child of Object.values(value)) walk(child);
  }

  walk(profile);
  return fields;
}
