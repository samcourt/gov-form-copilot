import { describe, expect, it } from "vitest";
import type { EvidenceDocument } from "@gov-form-copilot/shared";
import { buildProfile } from "./profileBuilder.js";

function doc(args: {
  id: string;
  type: EvidenceDocument["type"];
  label: string;
  values: Record<string, string>;
  confidence?: number;
}): EvidenceDocument {
  return {
    id: args.id,
    type: args.type,
    label: args.label,
    extractedAt: "2026-07-05T00:00:00.000Z",
    uploadedAt: "2026-07-05T00:00:00.000Z",
    values: Object.fromEntries(
      Object.entries(args.values).map(([path, value]) => [
        path,
        {
          value,
          sourceId: args.id,
          sourceType: args.type,
          sourceLabel: args.label,
          confidence: args.confidence ?? 0.9,
          extractedAt: "2026-07-05T00:00:00.000Z"
        }
      ])
    )
  };
}

describe("profileBuilder", () => {
  it("builds canonical student fields from evidence", () => {
    const profile = buildProfile([
      doc({
        id: "birth-cert",
        type: "birth_certificate",
        label: "Birth Certificate",
        values: {
          "student.givenName": "Penelope",
          "student.familyName": "Court",
          "student.dateOfBirth": "2017-03-14"
        }
      })
    ]);

    expect(profile.student.givenName.value).toBe("Penelope");
    expect(profile.student.familyName.value).toBe("Court");
    expect(profile.student.dateOfBirth.value).toBe("2017-03-14");
    expect(profile.student.givenName.status).toBe("verified");
  });

  it("uses source authority when choosing between competing values", () => {
    const profile = buildProfile([
      doc({
        id: "parent-declaration",
        type: "parent_declaration",
        label: "Parent Declaration",
        confidence: 1,
        values: {
          "student.familyName": "Smith"
        }
      }),
      doc({
        id: "birth-cert",
        type: "birth_certificate",
        label: "Birth Certificate",
        confidence: 0.8,
        values: {
          "student.familyName": "Court"
        }
      })
    ]);

    expect(profile.student.familyName.value).toBe("Court");
    expect(profile.student.familyName.status).toBe("conflicted");
    expect(profile.student.familyName.conflicts).toHaveLength(1);
    expect(profile.student.familyName.conflicts[0].value).toBe("Smith");
  });

  it("treats repeated matching values as supporting evidence, not conflicts", () => {
    const profile = buildProfile([
      doc({
        id: "birth-cert",
        type: "birth_certificate",
        label: "Birth Certificate",
        values: {
          "student.dateOfBirth": "2017-03-14"
        }
      }),
      doc({
        id: "passport",
        type: "passport",
        label: "Passport",
        values: {
          "student.dateOfBirth": "2017-03-14"
        }
      })
    ]);

    expect(profile.student.dateOfBirth.value).toBe("2017-03-14");
    expect(profile.student.dateOfBirth.status).toBe("verified");
    expect(profile.student.dateOfBirth.conflicts).toHaveLength(0);
    expect(profile.student.dateOfBirth.evidence).toHaveLength(2);
  });

  it("marks unsupported fields when no evidence exists", () => {
    const profile = buildProfile([]);

    expect(profile.student.givenName.status).toBe("unsupported");
    expect(profile.student.givenName.confidence).toBe(0);
    expect(profile.student.givenName.value).toBeUndefined();
    expect(profile.address.postcode.status).toBe("unsupported");
  });
});
