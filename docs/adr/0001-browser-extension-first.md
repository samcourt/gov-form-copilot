# ADR 0001: Browser Extension First

**Status:** Accepted  
**Date:** 2026-07-04

## Context
Gov Form Copilot's primary goal is to assist users while they complete existing government forms without requiring agencies to change their systems.

## Decision
The first client is a Chrome Extension.

The extension is responsible for:
- Discovering fields
- Displaying suggestions
- Applying values where appropriate
- Delegating reasoning to backend services

## Consequences

### Positive
- Works with existing government systems
- Rapid iteration
- Thin client

### Trade-offs
- Browser security limitations
- Custom UI controls require adapters

## Future
Additional clients can reuse the same backend services.
