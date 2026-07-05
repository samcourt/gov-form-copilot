# Data Flow

## Evidence asset flow

```text
User selects file
  ↓
POST /api/assets/upload
  ↓
EvidenceAsset
  ↓
server/data/uploads/
  ↓
GET /api/assets
  ↓
Profile Web App Evidence Library
```

## Evidence document flow

```text
Extracted text or structured values
  ↓
POST /api/documents/extract-text
or
POST /api/documents/evidence
  ↓
EvidenceDocument
  ↓
server/data/evidence/
  ↓
GET /api/evidence
```

## Profile flow

```text
EvidenceDocument[]
  ↓
buildProfileResult()
  ↓
CanonicalProfile
  ↓
GET /api/profile
```

## Suggestion flow

```text
Live web form
  ↓
Chrome content script scanner
  ↓
PageModel / FieldModel[]
  ↓
POST /api/suggestions
  ↓
CanonicalProfile from evidence
  ↓
FieldSuggestion[]
  ↓
Extension side panel
```

## Future OCR/AI flow

```text
EvidenceAsset
  ↓
OCR
  ↓
raw extracted text
  ↓
LLM structured extraction
  ↓
EvidenceDocument
  ↓
CanonicalProfile
```
