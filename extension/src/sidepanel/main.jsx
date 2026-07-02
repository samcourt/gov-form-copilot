import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE = 'http://localhost:8787';

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('No active tab found.');
  return tab;
}

function confidenceLabel(confidence) {
  if (confidence == null) return '—';
  return `${Math.round(confidence * 100)}%`;
}

function App() {
  const [status, setStatus] = useState('Ready. Open a form page and scan it.');
  const [pageModel, setPageModel] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  const [applying, setApplying] = useState({});

  async function scanPage() {
    setStatus('Scanning page...');
    setSuggestions({});

    try {
      const tab = await getActiveTab();
      const scanned = await chrome.tabs.sendMessage(tab.id, { type: 'SCAN_FIELDS' });
      setPageModel(scanned);
      setStatus(`Found ${scanned.fields?.length || 0} visible fields.`);

      const response = await fetch(`${API_BASE}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanned)
      });

      if (!response.ok) throw new Error(`Local API failed: ${response.status}`);
      const data = await response.json();
      setSuggestions(data.suggestions || {});
      setStatus(`Found ${scanned.fields?.length || 0} fields and ${Object.keys(data.suggestions || {}).length} suggestions.`);
    } catch (error) {
      setStatus(`Scan failed: ${error.message}`);
    }
  }

  async function applySuggestion(field, suggestion) {
    setApplying(prev => ({ ...prev, [field.fieldId]: true }));
    setStatus(`Applying ${field.label || field.name || field.fieldId}...`);

    try {
      const tab = await getActiveTab();
      const result = await chrome.tabs.sendMessage(tab.id, {
        type: 'APPLY_VALUE',
        fieldId: field.fieldId,
        value: suggestion.value
      });

      if (!result?.ok) throw new Error(result?.error || 'Apply failed.');
      setStatus('Applied. Review the page before continuing.');
    } catch (error) {
      setStatus(`Apply failed: ${error.message}`);
    } finally {
      setApplying(prev => ({ ...prev, [field.fieldId]: false }));
    }
  }

  const fields = pageModel?.fields || [];

  return (
    <main>
      <header>
        <h1>Gov Form Copilot</h1>
        <p>Supervised form assistance. You approve every value.</p>
      </header>

      <button className="primary" onClick={scanPage}>Scan page</button>
      <div className="status">{status}</div>

      {pageModel && (
        <section className="page-summary">
          <strong>{pageModel.title || 'Untitled page'}</strong>
          <small>{pageModel.url}</small>
        </section>
      )}

      <section className="field-list">
        {fields.map(field => {
          const suggestion = suggestions[field.fieldId];
          const name = field.label || field.name || field.fieldId;

          return (
            <article className="field-card" key={field.fieldId}>
              <div className="field-heading">
                <strong>{name}</strong>
                <span>{field.type}</span>
              </div>

              {field.section && <div className="section-name">Section: {field.section}</div>}
              {field.value && <div className="current-value">Current: {field.value}</div>}

              {!field.safeToFill && (
                <div className="warning">Blocked from auto-fill in this prototype.</div>
              )}

              {suggestion ? (
                <div className="suggestion">
                  <div className="suggested-value">{String(suggestion.value)}</div>
                  <div className="meta">
                    {confidenceLabel(suggestion.confidence)} · {suggestion.source || 'No source'}
                  </div>
                  {suggestion.reason && <div className="reason">{suggestion.reason}</div>}
                  <button
                    disabled={!field.safeToFill || applying[field.fieldId]}
                    onClick={() => applySuggestion(field, suggestion)}
                  >
                    {applying[field.fieldId] ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="no-suggestion">No suggestion yet.</div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
