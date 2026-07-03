// server/src/pipelines/suggestAnswers.js

import fs from "fs/promises";

export async function suggestAnswers(fields) {
  const profile = JSON.parse(
    await fs.readFile("./data/profile.json", "utf-8")
  );

  const evidence = JSON.parse(
    await fs.readFile("./data/evidence/extracted.json", "utf-8")
  );

  return fields.map((field) => {
    const label = `${field.label} ${field.name} ${field.type}`.toLowerCase();

    const suggestion = matchField(label, profile, evidence);

    return {
      fieldId: field.fieldId,
      label: field.label,
      type: field.type,
      suggestion
    };
  });
}

function matchField(label, profile, evidence) {
  if (label.includes("child") && label.includes("given")) {
    return fromEvidence(profile.child.givenName, "Birth certificate", 0.95);
  }

  if (label.includes("child") && label.includes("family")) {
    return fromEvidence(profile.child.familyName, "Birth certificate", 0.95);
  }

  if (label.includes("date of birth") || label.includes("dob")) {
    return fromEvidence(profile.child.dateOfBirth, "Birth certificate", 0.95);
  }

  if (label.includes("address")) {
    return fromEvidence(profile.address.fullAddress, "Utility bill", 0.9);
  }

  return null;
}

function fromEvidence(value, source, confidence) {
  if (!value) return null;

  return {
    value,
    source,
    confidence,
    reason: `Matched from ${source}`
  };
}