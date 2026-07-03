import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import type { FieldSuggestion, PageModel, SuggestionsResponse } from "@gov-form-copilot/shared";
import "./style.css";

function App() {
  const [page, setPage] = useState<PageModel | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, FieldSuggestion>>({});
  const [status, setStatus] = useState("Ready");

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab found");
    return tab;
  }

  async function scanPage() {
    setStatus("Scanning page...");
    const tab = await getActiveTab();
    const scanned = await chrome.tabs.sendMessage(tab.id!, { type: "SCAN_PAGE" }) as PageModel;
    setPage(scanned);

    setStatus("Getting suggestions...");
    const response = await fetch("http://localhost:8787/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: scanned })
    });

    const data = await response.json() as SuggestionsResponse;
    if (!data.ok) throw new Error(data.error ?? "Suggestions failed");

    setSuggestions(data.suggestions);
    setStatus(`Found ${scanned.fields.length} fields and ${Object.keys(data.suggestions).length} suggestions.`);
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
        {page?.fields.map((field) => {
          const suggestion = suggestions[field.fieldId];
          return (
            <article className="field-card" key={field.fieldId}>
              <div className="field-title">{field.label || field.name || field.fieldId}</div>
              <div className="field-meta">{field.type} · {field.safeToFill ? "safe to fill" : "blocked"}</div>

              {suggestion ? (
                <div className="suggestion">
                  <div className="suggested-value">{suggestion.value}</div>
                  <div className="field-meta">{Math.round(suggestion.confidence * 100)}% · {suggestion.source}</div>
                  <div className="reason">{suggestion.reason}</div>
                  <button disabled={!field.safeToFill} onClick={() => applySuggestion(field.fieldId)}>Apply</button>
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
