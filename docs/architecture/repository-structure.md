# Repository Structure

```text
gov-form-copilot/
├── extension/
├── server/
├── shared/
├── web/
└── docs/
```

## `shared/`

Shared TypeScript models.

If a type crosses package boundaries, it belongs in `shared`.

## `server/`

Express API.

Owns evidence asset storage, evidence document persistence, document ingestion, canonical profile generation and suggestion generation.

## `web/`

Profile & Evidence Portal.

Owns file upload, evidence browsing and profile inspection.

## `extension/`

Chrome extension.

Owns live form scanning and applying approved values.

## `docs/`

Architecture and decision records.
