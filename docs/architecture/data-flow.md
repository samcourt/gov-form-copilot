# Data Flow

## Suggestion Flow

```text
Browser page
  ↓
Content script scans DOM
  ↓
PageModel
  ↓
POST /api/suggestions
  ↓
Decision Engine
  ↓
FieldSuggestion[]
  ↓
Side panel renders suggestion cards
  ↓
User approves Apply
  ↓
Content script applies value to page
```

## Evidence Flow

```text
Evidence input
  ↓
Document Ingestion
  ↓
EvidenceDocument
  ↓
Evidence Store
  ↓
Profile Builder
  ↓
CanonicalProfile
  ↓
Decision Engine
```

## Profile Flow

The canonical profile is generated, not hand-maintained.

```text
EvidenceDocuments[] → CanonicalProfile
```

## Important Rule

The profile should be treated as a derived artifact. Evidence remains the source of truth.
