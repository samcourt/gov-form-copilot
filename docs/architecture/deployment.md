# Deployment

## Current Development Deployment

```text
Windows machine
  ├─ Chrome Extension
  ├─ Local Node/Express API
  └─ Local JSON evidence store
```

## Current Runtime

- Extension runs in Chrome.
- API runs locally on `http://localhost:8787`.
- Evidence documents are stored as JSON files.
- No cloud persistence yet.

## Future Options

### Local-first

Documents and evidence remain on the user's machine.

Pros:
- Strong privacy
- Simple trust model

Cons:
- Harder sync and backup

### Hybrid

Sensitive evidence remains local; AI services may be called selectively.

Pros:
- Practical
- Flexible

Cons:
- Requires careful privacy controls

### Cloud

Evidence and profiles stored centrally.

Pros:
- Multi-device
- Enterprise governance

Cons:
- Higher privacy, security and compliance burden

## Current Direction

Local-first until there is a strong reason to centralise.
