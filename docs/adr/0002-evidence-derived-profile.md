# ADR 0002: Canonical Profile is Derived from Evidence

**Status:** Accepted  
**Date:** 2026-07-04

## Context
Maintaining both profile.json and evidence duplicates information.

## Decision
The canonical profile is generated from evidence.

Evidence Documents
→ Evidence Engine
→ Canonical Profile

## Consequences

### Positive
- Single source of truth
- Traceable decisions
- Easier conflict resolution

### Trade-offs
- Profile generation becomes part of processing

## Future
Move to incremental regeneration when needed.
