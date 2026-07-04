# Architecture

Gov Form Copilot is an evidence-backed form assistance platform.

The browser extension is the first client, but the core product is a set of backend services that understand forms, evidence and decisions.

## High-level Flow

```text
User documents
  ↓
Document Ingestion
  ↓
Evidence Engine
  ↓
Canonical Profile
  ↓
Decision Engine
  ↓
Extension UI
  ↓
Government form
```

## Bounded Services

Gov Form Copilot is organised around five bounded services:

1. **Semantic Scanner** — understands the structure and meaning of a web form.
2. **Document Ingestion** — accepts documents, text or structured evidence and turns them into evidence documents.
3. **Evidence Engine** — stores, ranks and reconciles evidence.
4. **Decision Engine** — decides what to suggest, why, and with what confidence.
5. **Extension UI** — presents suggestions and allows the user to review/apply values.

Each service should be independently testable and replaceable.

## Principles

- The user remains in control.
- The canonical profile is derived from evidence.
- Every suggestion should be explainable.
- Every value should be traceable.
- The extension should remain thin.
