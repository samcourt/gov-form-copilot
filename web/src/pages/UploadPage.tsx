import { useState } from "react";
import { ingestExtractedText, ingestStructuredEvidence, uploadAsset, type EvidenceAsset } from "../api/client";

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
  assets: EvidenceAsset[];
  onUploaded: (message: string) => void;
}

export function UploadPage({ assets, onUploaded }: UploadPageProps) {
  const [mode, setMode] = useState<"file" | "text" | "structured">("file");
  const [sourceType, setSourceType] = useState("birth_certificate");
  const [label, setLabel] = useState("Birth Certificate");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("Given Names: Penelope\nFamily Name: Court\nDate of Birth: 14/03/2017\nCountry of Birth: Australia");
  const [structuredJson, setStructuredJson] = useState(JSON.stringify({
    "student.givenName": "Penelope",
    "student.familyName": "Court",
    "student.dateOfBirth": "2017-03-14",
    "student.countryOfBirth": "Australia"
  }, null, 2));
  const [error, setError] = useState("");

  async function submit() {
    try {
      setError("");
      if (mode === "file") {
        if (!selectedFile) throw new Error("Choose a file first.");
        const result = await uploadAsset({ file: selectedFile, sourceType, label: label || selectedFile.name });
        onUploaded(`Uploaded ${result.asset.originalFilename}.`);
        return;
      }
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
      <div className="hero"><h2>Upload / Ingest Evidence</h2><p>Upload the original evidence file, or paste extracted text / structured facts.</p></div>
      <section className="card form-card">
        <div className="segmented">
          <button className={mode === "file" ? "active" : ""} onClick={() => setMode("file")}>File upload</button>
          <button className={mode === "text" ? "active" : ""} onClick={() => setMode("text")}>Extracted text</button>
          <button className={mode === "structured" ? "active" : ""} onClick={() => setMode("structured")}>Structured values</button>
        </div>
        <label><span>Document type</span><select value={sourceType} onChange={(event) => setSourceType(event.target.value)}>{SOURCE_TYPES.map((source) => <option key={source.value} value={source.value}>{source.label}</option>)}</select></label>
        <label><span>Label</span><input value={label} onChange={(event) => setLabel(event.target.value)} /></label>
        {mode === "file" && <label><span>File</span><input type="file" accept=".pdf,image/png,image/jpeg,image/webp,text/plain" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} /></label>}
        {mode === "text" && <label><span>Extracted text</span><textarea rows={12} value={rawText} onChange={(event) => setRawText(event.target.value)} /></label>}
        {mode === "structured" && <label><span>Structured values JSON</span><textarea rows={12} value={structuredJson} onChange={(event) => setStructuredJson(event.target.value)} /></label>}
        {error && <p className="error">{error}</p>}
        <button onClick={submit}>{mode === "file" ? "Upload asset" : "Ingest evidence"}</button>
      </section>
      {assets.length > 0 && <section className="card"><h3>Recently uploaded assets</h3><p>{assets.length} files currently in the Evidence Library.</p></section>}
    </section>
  );
}
