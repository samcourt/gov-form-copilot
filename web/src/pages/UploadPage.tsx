import { useState } from "react";
import { ingestExtractedText, ingestStructuredEvidence } from "../api/client";

const DOCUMENT_TEMPLATES: Record<string, { label: string; rawText: string; structured: Record<string, string> }> = {
  birth_certificate: {
    label: "Birth Certificate Test",
    rawText:
      "Given Names: Penelope\nFamily Name: Court\nDate of Birth: 14/03/2017\nCountry of Birth: Australia",
    structured: {
      "student.givenName": "Penelope",
      "student.familyName": "Court",
      "student.dateOfBirth": "2017-03-14",
      "student.countryOfBirth": "Australia"
    }
  },
  utility_bill: {
    label: "Utility Bill Test",
    rawText:
      "Account holder: Sam Court\nService Address: 12 Example Street, Surry Hills NSW 2010\nSupply Address: 12 Example Street, Surry Hills NSW 2010",
    structured: {
      "account.holder": "Sam Court",
      "account.serviceAddress": "12 Example Street, Surry Hills NSW 2010",
      "account.supplyAddress": "12 Example Street, Surry Hills NSW 2010"
    }
  },
  parent_declaration: {
    label: "Parent Declaration Test",
    rawText:
      "Student gender: Female\nResidency status: Australian Citizen\nAboriginal or Torres Strait Islander: No\nLanguage other than English at home: No\nAttended another school: No",
    structured: {
      "student.gender": "Female",
      "student.residencyStatus": "Australian Citizen",
      "student.aboriginalOrTorresStraitIslander": "No",
      "student.languageOtherThanEnglishAtHome": "No",
      "student.attendedAnotherSchool": "No"
    }
  },
  passport: {
    label: "Passport Test",
    rawText: "Given Names: Penelope\nFamily Name: Court\nDate of Birth: 14/03/2017\nNationality: Australian",
    structured: {
      "student.givenName": "Penelope",
      "student.familyName": "Court",
      "student.dateOfBirth": "2017-03-14",
      "student.nationality": "Australian"
    }
  },
  medicare: {
    label: "Medicare Test",
    rawText: "Name: Penelope Court\nMedicare Number: 2123456789",
    structured: {
      "student.name": "Penelope Court",
      "student.medicareNumber": "2123456789"
    }
  },
  immunisation: {
    label: "Immunisation Test",
    rawText: "Name: Penelope Court\nDate of Birth: 14/03/2017\nImmunisation status: Up to date",
    structured: {
      "student.name": "Penelope Court",
      "student.dateOfBirth": "2017-03-14",
      "student.immunisationStatus": "Up to date"
    }
  },
  unknown: {
    label: "Unknown Document Test",
    rawText: "",
    structured: {}
  }
};

const SOURCE_TYPES = [
  { value: "birth_certificate", label: "Birth Certificate" },
  { value: "utility_bill", label: "Utility Bill" },
  { value: "passport", label: "Passport" },
  { value: "medicare", label: "Medicare" },
  { value: "immunisation", label: "Immunisation" },
  { value: "parent_declaration", label: "Parent Declaration" },
  { value: "unknown", label: "Unknown" }
];

interface UploadPageProps {
  onUploaded: (message: string) => void;
}

export function UploadPage({ onUploaded }: UploadPageProps) {
  const [mode, setMode] = useState<"text" | "structured">("text");
  const [sourceType, setSourceType] = useState("birth_certificate");
  const [label, setLabel] = useState("Birth Certificate Test");
  const [rawText, setRawText] = useState(
    "Given Names: Penelope\nFamily Name: Court\nDate of Birth: 14/03/2017\nCountry of Birth: Australia"
  );
  const [structuredJson, setStructuredJson] = useState(
    JSON.stringify(
      {
        "student.givenName": "Penelope",
        "student.familyName": "Court",
        "student.dateOfBirth": "2017-03-14",
        "student.countryOfBirth": "Australia"
      },
      null,
      2
    )
  );
  const [error, setError] = useState("");

  async function submit() {
    try {
      setError("");

      if (mode === "text") {
        const result = await ingestExtractedText({ sourceType, label, rawText });
        onUploaded(`Ingested ${result.evidenceDocument.label}; extracted ${result.extractedFields.length} fields.`);
        return;
      }

      const values = JSON.parse(structuredJson) as Record<string, string>;
      const result = await ingestStructuredEvidence({ sourceType, label, values });
      onUploaded(`Ingested ${result.evidenceDocument.label}.`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return (
    <section className="page-grid">
      <div className="hero">
        <h2>Upload / Ingest Evidence</h2>
        <p>
          For now, paste extracted text or structured JSON. File upload and OCR come next.
        </p>
      </div>

      <section className="card form-card">
        <div className="segmented">
          <button className={mode === "text" ? "active" : ""} onClick={() => setMode("text")}>
            Extracted text
          </button>
          <button className={mode === "structured" ? "active" : ""} onClick={() => setMode("structured")}>
            Structured values
          </button>
        </div>

        <label>
          <span>Document type</span>

          <select
            value={sourceType}
            onChange={(event) => {
              const nextSourceType = event.target.value;
              setSourceType(nextSourceType);

              const template = DOCUMENT_TEMPLATES[nextSourceType];
              if (template) {
                setLabel(template.label);
                setRawText(template.rawText);
                setStructuredJson(JSON.stringify(template.structured, null, 2));
              }
            }}
          >
            {SOURCE_TYPES.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Label</span>
          <input value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>

        {mode === "text" ? (
          <label>
            <span>Extracted text</span>
            <textarea rows={12} value={rawText} onChange={(event) => setRawText(event.target.value)} />
          </label>
        ) : (
          <label>
            <span>Structured values JSON</span>
            <textarea rows={12} value={structuredJson} onChange={(event) => setStructuredJson(event.target.value)} />
          </label>
        )}

        {error && <p className="error">{error}</p>}

        <button onClick={submit}>Ingest evidence</button>
      </section>
    </section>
  );
}
