# Evidence Engine

Purpose: convert many source documents into one trusted profile.

Evidence Engine turns extracted evidence documents into a canonical profile consumed by the suggestion engine.

## Inputs

- Birth Certificate
- Passport
- Utility Bill
- Medicare
- Immunisation
- Court Orders

## Outputs

- Canonical profile
- Confidence
- Conflicting evidence
- Traceability

Design principle: store **facts**, not documents.

## Flow

Evidence documents → Evidence Store → Profile Builder → Canonical Profile → Suggestion Engine → Browser Extension

## Endpoints

- `GET /api/evidence`
- `POST /api/evidence`
- `GET /api/profile`
- `POST /api/suggestions`

## Known limitations

- Evidence documents are JSON fixtures for now.
- OCR/document upload is not implemented.
- Conflict resolution is highest authority × confidence.
