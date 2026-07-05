# API Reference

Base URL:

```text
http://localhost:8787
```

## Health

### GET `/health`

```json
{
  "ok": true,
  "service": "gov-form-copilot-server"
}
```

## Assets

Evidence assets are original uploaded files.

### GET `/api/assets`

```json
{
  "ok": true,
  "assets": []
}
```

### POST `/api/assets/upload`

Uploads one file.

Request type: `multipart/form-data`

Fields:

| Field | Required | Description |
|---|---:|---|
| `file` | yes | PDF, JPG, PNG, WebP or TXT |
| `sourceType` | no | Example: `birth_certificate` |
| `label` | no | User-facing label |

### GET `/api/assets/:assetId/file`

Streams the uploaded file.

### DELETE `/api/assets/:assetId`

Deletes asset metadata and stored file.

## Evidence

Evidence documents are structured extracted facts.

### GET `/api/evidence`

```json
{
  "ok": true,
  "evidenceDocuments": []
}
```

### POST `/api/evidence`

Stores a complete `EvidenceDocument`.

### DELETE `/api/evidence/:documentId`

Deletes a structured evidence document.

## Documents / Ingestion

### POST `/api/documents/extract-text`

Converts extracted text into an `EvidenceDocument`.

```json
{
  "sourceType": "birth_certificate",
  "label": "Birth Certificate",
  "rawText": "Given Names: Penelope\nFamily Name: Court\nDate of Birth: 14/03/2017"
}
```

### POST `/api/documents/evidence`

Creates an evidence document from structured profile path values.

```json
{
  "sourceType": "utility_bill",
  "label": "Utility Bill",
  "values": {
    "address.line1": "12 Example Street",
    "address.suburb": "Surry Hills",
    "address.state": "NSW",
    "address.postcode": "2010"
  }
}
```

### POST `/api/documents/import`

Imports a full `EvidenceDocument`.

## Profile

### GET `/api/profile`

Builds and returns the canonical profile.

```json
{
  "ok": true,
  "profile": {},
  "documents": 3,
  "fields": 21,
  "conflicts": 1,
  "generatedAt": "2026-07-05T00:00:00.000Z",
  "evidenceDocuments": []
}
```

## Suggestions

### POST `/api/suggestions`

Builds suggestions for a scanned page model.

```json
{
  "fields": [],
  "pageModel": {}
}
```

## Evidence source types

```text
birth_certificate
utility_bill
passport
medicare
immunisation
parent_declaration
unknown
```
