# Document Ingestion v1

Document Ingestion v1 introduces the first server-side pathway for turning user-provided evidence into canonical profile data.

This is not full OCR yet. It supports:

1. importing already-structured evidence JSON;
2. submitting extracted text;
3. rule-based extraction into EvidenceDocument objects;
4. saving evidence documents;
5. rebuilding the canonical profile.

## Endpoints

### POST `/api/documents/evidence`

Accepts simple structured values.

### POST `/api/documents/extract-text`

Accepts extracted/OCR text.

### POST `/api/documents/import`

Accepts a complete `EvidenceDocument`.

## Why this matters

This removes the need to hand-maintain `profile.json`.

The canonical profile is now a derived artifact:

```text
documents → evidence store → profile builder → canonical profile
```

## Known limitations

- No file upload yet.
- No OCR yet.
- The extractor is rule-based and deliberately conservative.
- Real document extraction should later use OCR + LLM structured output.
