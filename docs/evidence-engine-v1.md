# Evidence Engine v1

Evidence Engine v1 turns extracted evidence documents into a canonical profile consumed by the suggestion engine.

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
