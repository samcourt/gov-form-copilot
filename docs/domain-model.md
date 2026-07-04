# Domain Model

This document describes the core objects in Gov Form Copilot.

## EvidenceDocument

A structured representation of a source document or declaration.

Examples:

- Birth Certificate
- Utility Bill
- Passport
- Medicare Card
- Parent Declaration

An `EvidenceDocument` contains many `EvidenceValue` records.

## EvidenceValue

A single fact extracted from an evidence document.

Example:

```json
{
  "value": "Penelope",
  "sourceId": "birth-certificate-001",
  "sourceType": "birth_certificate",
  "sourceLabel": "Birth Certificate",
  "confidence": 0.99
}
```

## CanonicalProfile

A derived profile assembled from evidence.

The profile is not the source of truth. It is generated from evidence documents.

## ProfileField

A single field in the canonical profile.

It contains:

- selected value
- confidence
- status
- supporting evidence
- conflicting evidence
- reason

## FieldModel

A semantic representation of a field on a web form.

It includes:

- label
- type
- required/optional
- section
- help text
- options
- safety classification

## FieldSuggestion

A decision produced by matching a `FieldModel` to a `ProfileField`.

It includes:

- suggested value
- confidence
- source
- reasoning
- evidence

## PageModel

A semantic representation of the current page or step in a form.

It contains sections and fields.
