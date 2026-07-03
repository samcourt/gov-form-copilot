# Gov Form Copilot Architecture

## Vision

Gov Form Copilot is an AI-assisted platform that helps people complete complex government forms with human oversight. The browser extension never submits data automatically. Users review every suggested value.

## High-level Architecture

```
Documents
    │
    ▼
Evidence Extraction
    │
    ▼
Evidence Store
    │
    ▼
Canonical Profile
    │
    ▼
AI Reasoning Engine
    │
    ▼
Browser Extension
    │
    ▼
Government Web Form
```

## Components

- **Extension**: scans pages, presents suggestions, applies approved values.
- **Server**: profile generation, matching, AI reasoning, APIs.
- **Shared**: TypeScript models shared by extension and server.
- **Evidence Store**: structured facts extracted from source documents.
