import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { FieldModel, FieldSuggestion, PageModel, SuggestionsResponse } from "@gov-form-copilot/shared";
import "./style.css";

interface ScanPageResponse {
  ok?: boolean;
  fields?: FieldModel[];
  pageModel?: PageModel;
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

  const fields = useMemo(() => flattenFields(page), [page]);

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab found");
    return tab;
  }

  async function scanPage() {
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
  }

  async function applySuggestion(fieldId: string) {
    const suggestion = suggestions[fieldId];
    if (!suggestion) return;

    const tab = await getActiveTab();
    const result = await chrome.tabs.sendMessage(tab.id!, {
      type: "APPLY_VALUE",
      fieldId,
      value: suggestion.value
    });

    setStatus(result.ok ? `Applied ${suggestion.value}` : `Apply failed: ${result.error}`);
  }

  return (
    <main>
      <header>
        <h1>Gov Form Copilot</h1>
        <button onClick={() => scanPage().catch((error) => setStatus(error.message))}>Scan page</button>
      </header>

      <p className="status">{status}</p>

      {page && (
        <section className="page-summary">
          <strong>{page.title || "Untitled page"}</strong>
          <span>{page.url}</span>
        </section>
      )}

      <section>
        {fields.map((field) => {
          const suggestion = suggestions[field.fieldId];

          return (
            <article className="field-card" key={field.fieldId}>
              <div className="field-title">{field.label || field.name || field.fieldId}</div>
              <div className="field-meta">
                {field.fieldType} · {field.safeToFill ? "safe to fill" : "blocked"}
                {field.section ? ` · ${field.section}` : ""}
              </div>

              {suggestion ? (
                <div className="suggestion">
                  <div className="suggested-value">{suggestion.value}</div>
                  <div className="field-meta">
                    {Math.round(suggestion.confidence * 100)}% · {suggestion.source}
                  </div>
                  <div className="reason">{suggestion.reason}</div>
                  <button disabled={!field.safeToFill} onClick={() => applySuggestion(field.fieldId)}>
                    Apply
                  </button>
                </div>
              ) : (
                <div className="no-suggestion">No suggestion</div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
