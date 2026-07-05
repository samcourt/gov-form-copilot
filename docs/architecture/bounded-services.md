# Bounded Services

## Semantic Scanner

Responsible for converting the live DOM into a semantic `PageModel`.

Owns:

- field detection
- section detection
- label extraction
- safety classification
- field metadata
- apply behaviour

## Document Ingestion

Responsible for accepting new evidence inputs.

Owns:

- structured evidence import
- extracted text import
- future file upload
- future OCR orchestration
- future LLM extraction orchestration

## Evidence Engine

Responsible for storing and reconciling evidence.

Owns:

- EvidenceDocument
- EvidenceValue
- evidence confidence
- authority ranking
- conflict detection
- canonical profile generation

## Decision Engine

Responsible for deciding what to suggest.

Owns:

- field-to-profile matching
- confidence combination
- evidence attribution
- policy-aware reasoning
- manual handoff decisions

## Extension UI

Responsible for user interaction.

Owns:

- scan button
- suggestion cards
- evidence display
- apply buttons
- user feedback
