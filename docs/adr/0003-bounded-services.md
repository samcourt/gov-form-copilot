# ADR 0003: Organise Around Bounded Services

**Status:** Accepted  
**Date:** 2026-07-04

## Context
The project has grown beyond browser autofill into an evidence-backed decision platform.

## Decision
Use these bounded services:

1. Semantic Scanner
2. Document Ingestion
3. Evidence Engine
4. Decision Engine
5. Extension UI

Each service owns its responsibilities and public interfaces.

## Consequences

### Positive
- Separation of concerns
- Independent testing
- Reusable backend

### Trade-offs
- More interfaces to maintain

## Future
Add OCR, LLM extraction and policy reasoning within the appropriate service.
