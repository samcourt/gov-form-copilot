import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type {
  FieldModel,
  FieldSuggestion,
  PageModel,
  SuggestionsResponse
} from "@gov-form-copilot/shared";
import { PageSummary } from "./components/PageSummary";
import { ScannerSummary } from "./components/ScannerSummary";
import { SuggestionCard } from "./components/SuggestionCard";
import "./style.css";

interface ScanPageResponse {
  ok?: boolean;
  fields?: FieldModel[];
  pageModel?: PageModel;
  error?: string;
}

interface ApplyResult {
  ok: boolean;
  error?: string;
}

function flattenFields(pageModel: PageModel | null): FieldModel[] {
  if (!pageModel) return [];

  return pageModel.sections.flatMap((section) =>
    section.fields.map((field) => ({
      ...field,
      section: field.section ?? section.title
    }))
  );
}

function App() {
  const [page, setPage] = useState<PageModel | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, FieldSuggestion>>({});
  const [status, setStatus] = useState("Ready");
  const [isScanning, setIsScanning] = useState(false);

  const fields = useMemo(() => flattenFields(page), [page]);
  const matchedCount = Object.keys(suggestions).length;
  const safeCount = fields.filter((field) => field.safeToFill).length;
  const blockedCount = fields.length - safeCount;

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab found");
    return tab;
  }

  async function scanPage() {
    try {
      setIsScanning(true);
      setStatus("Scanning page...");
      setSuggestions({});

      const tab = await getActiveTab();

      const scanResult = (await chrome.tabs.sendMessage(tab.id!, {
        type: "SCAN_PAGE"
      })) as ScanPageResponse | PageModel;

      const pageModel =
        "pageModel" in scanResult && scanResult.pageModel
          ? scanResult.pageModel
          : (scanResult as PageModel);

      if (!pageModel?.sections) {
        throw new Error(
          "Scan did not return a valid page model. Check that the content script is loaded and returning pageModel."
        );
      }

      const scannedFields =
        "fields" in scanResult && Array.isArray(scanResult.fields)
          ? scanResult.fields
          : flattenFields(pageModel);

      setPage(pageModel);
      setStatus("Getting suggestions...");

      const response = await fetch("http://localhost:8787/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fields: scannedFields,
          pageModel
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Suggestions API failed (${response.status}): ${text.slice(0, 200)}`);
      }

      const data = (await response.json()) as SuggestionsResponse & {
        ok?: boolean;
        error?: string;
      };

      if (data.ok === false) {
        throw new Error(data.error ?? "Suggestions failed");
      }

      const nextSuggestions = data.suggestions ?? {};
      setSuggestions(nextSuggestions);
      setStatus(`Found ${scannedFields.length} fields and ${Object.keys(nextSuggestions).length} suggestions.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Scan failed");
    } finally {
      setIsScanning(false);
    }
  }

  async function applySuggestion(fieldId: string) {
    const suggestion = suggestions[fieldId];
    if (!suggestion) return;

    try {
      const tab = await getActiveTab();
      const result = (await chrome.tabs.sendMessage(tab.id!, {
        type: "APPLY_VALUE",
        fieldId,
        value: suggestion.value
      })) as ApplyResult;

      setStatus(result.ok ? `Applied ${suggestion.value}` : `Apply failed: ${result.error}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Apply failed");
    }
  }

  return (
    <main>
      <header className="app-header">
        <div>
          <h1>Gov Form Copilot</h1>
          <p>Evidence-backed form assistance</p>
        </div>

        <button onClick={scanPage} disabled={isScanning}>
          {isScanning ? "Scanning..." : "Scan page"}
        </button>
      </header>

      <p className="status">{status}</p>

      {page && (
        <>
          <PageSummary page={page} />
          <ScannerSummary
            fieldCount={fields.length}
            matchedCount={matchedCount}
            safeCount={safeCount}
            blockedCount={blockedCount}
          />
        </>
      )}

      <section className="field-list">
        {fields.map((field) => (
          <SuggestionCard
            key={field.fieldId}
            field={field}
            suggestion={suggestions[field.fieldId]}
            onApply={() => applySuggestion(field.fieldId)}
          />
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
