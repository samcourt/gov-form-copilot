# ADR 0004: Human Remains in the Loop

**Status:** Accepted  
**Date:** 2026-07-04

## Context
Government forms often involve legal declarations and ambiguous evidence.

## Decision
Gov Form Copilot recommends rather than silently completes.

The system should:
- Explain every suggestion
- Show evidence
- Show confidence
- Surface conflicts
- Require confirmation where appropriate

## Consequences

### Positive
- Trustworthy
- Auditable
- Handles uncertainty well

### Trade-offs
- Slightly slower completion

## Future
Permit automatic application for low-risk fields where policy allows.
