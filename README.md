# Gov Form Copilot

Gov Form Copilot is an evidence-backed assistant for completing government forms.

It has two user-facing surfaces:

- **Profile Web App** — upload and manage evidence, inspect extracted facts, and review the canonical profile.
- **Chrome Extension** — scan a live government form, suggest evidence-backed answers, and let the user apply approved values.

## Current version

**v0.5 alpha**

Core capabilities:

- Semantic page scanner
- Evidence document model
- Canonical profile builder
- Document ingestion endpoints
- Evidence asset library
- Profile web app
- Chrome extension side panel
- Shared TypeScript models

## Architecture

```text
Evidence files
  ↓
Evidence Asset Library
  ↓
Document Ingestion
  ↓
Evidence Documents
  ↓
Evidence Engine
  ↓
Canonical Profile
  ↓
Decision / Suggestion Engine
  ↓
Browser Extension
  ↓
Government form
```

## Repository structure

```text
extension/   Chrome extension for scanning and applying suggestions
server/      Express API for evidence, profile, ingestion and suggestions
shared/      Shared TypeScript models
web/         Profile & Evidence Portal
docs/        Architecture, API and decision records
```

## Local development

```powershell
npm install
npm run build
npm run dev:server
npm run dev:web
```

Open:

```text
http://localhost:5174
```

API:

```text
http://localhost:8787
```

Useful checks:

```text
http://localhost:8787/health
http://localhost:8787/api/assets
http://localhost:8787/api/evidence
http://localhost:8787/api/profile
```

## Development principles

- The user remains in control.
- The browser extension stays thin.
- The canonical profile is derived from evidence.
- Every suggestion should be traceable to evidence.
- Original uploaded files and extracted facts are separate concepts.
- Shared models are the source of truth for cross-package types.

## Current limitations

- File upload stores original assets but does not yet run OCR.
- Text extraction is rule-based and basic.
- Conflict resolution is detected but not yet resolved in the UI.
- Some custom form controls still need stronger apply adapters.
