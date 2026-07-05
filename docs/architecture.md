# Architecture

Gov Form Copilot is an evidence-backed form assistance platform.

## System overview

```text
Profile Web App
  - upload files
  - review evidence
  - inspect profile
        ↓
Server API
  - assets
  - ingestion
  - evidence
  - profile
  - suggestions
        ↓
Shared Domain Models
  - EvidenceAsset
  - EvidenceDocument
  - CanonicalProfile
  - PageModel
  - FieldSuggestion
        ↓
Chrome Extension
  - scan page
  - show suggestions
  - apply values
```

## Data flow

```text
PDF/JPG/PNG/TXT upload
  ↓
EvidenceAsset
  ↓
OCR / extraction later
  ↓
EvidenceDocument
  ↓
Evidence Engine
  ↓
CanonicalProfile
  ↓
Suggestion Engine
  ↓
FieldSuggestion
  ↓
Chrome Extension
```

## Bounded services

### Evidence Asset Library

Owns original uploaded files. An `EvidenceAsset` is file metadata and storage reference.

### Document Ingestion

Turns extracted text or structured values into `EvidenceDocument` records.

### Evidence Engine

Ranks evidence, scores confidence, detects conflicts and builds the canonical profile.

### Semantic Scanner

Understands the live browser page and produces a `PageModel`.

### Suggestion Engine

Matches page fields to profile fields and produces explainable suggestions.

### Profile Web App

Manages upload, evidence review, and profile inspection.

### Chrome Extension

Handles in-form assistance only.

## Key modelling distinction

```text
EvidenceAsset      = original uploaded file
EvidenceDocument   = structured facts extracted from a source
CanonicalProfile   = derived profile built from evidence documents
FieldSuggestion    = decision for one form field
```
