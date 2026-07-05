# Bounded Services

## Profile Web App

Responsible for profile and evidence management.

Owns:

- upload UI
- evidence library UI
- profile viewer
- future conflict resolution UI

Does not own:

- browser page scanning
- applying values into external forms

## Chrome Extension

Responsible for in-form assistance.

Owns:

- content script scanning
- side panel suggestions
- applying approved values

Does not own:

- document upload
- household profile management
- evidence conflict resolution

## Server API

Responsible for domain operations.

Owns:

- asset upload and storage
- evidence document persistence
- document ingestion
- canonical profile building
- suggestion generation

## Shared Models

Responsible for cross-package type contracts.

Owns:

- `EvidenceAsset`
- `EvidenceDocument`
- `CanonicalProfile`
- `PageModel`
- `FieldModel`
- `FieldSuggestion`

Rule: if the same concept crosses more than one package boundary, it belongs in `shared`.

## Evidence Engine

Responsible for deciding which evidence-backed values are currently canonical.

Owns:

- authority ranking
- confidence scoring
- supporting evidence
- conflicting evidence
- unsupported fields

## Document Ingestion

Responsible for turning inputs into structured evidence.

Owns:

- extracted text ingestion
- structured value ingestion
- rule-based extraction
- future OCR / LLM extraction pipeline
