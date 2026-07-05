# Technical Debt Register

This document records known cleanup work after v0.5.

## High priority

### Remove stale server-local evidence types

Current state:

```text
server/src/evidence/types.ts
```

is kept as a backwards-compatible re-export.

Target state:

- import evidence/profile types directly from `@gov-form-copilot/shared`
- delete `server/src/evidence/types.ts`

### Remove unused legacy JSON files

Current legacy files:

```text
server/data/profile.json
server/data/evidence.json
```

They are no longer the main source of truth.

Target state:

- preserve any useful sample data under `samples/`
- delete the legacy runtime files once confirmed unused

### Remove old service evidence store

Check whether this is still referenced:

```text
server/src/services/evidenceStore.ts
```

Target state:

- delete if unused
- keep only `server/src/evidence/evidenceStore.ts`

## Medium priority

### Add API route tests

Needed tests:

- `GET /api/profile`
- `GET /api/evidence`
- `POST /api/documents/evidence`
- `POST /api/documents/extract-text`
- `POST /api/assets/upload`

### Separate sample data from runtime data

Current runtime evidence lives in:

```text
server/data/evidence/
```

Future structure:

```text
samples/evidence/
server/data/evidence/
server/data/uploads/
```

### Add fixture-driven suggestion tests

The extension scanner and suggestion engine should have fixtures for:

- simple input fields
- split DOB fields
- select controls
- checkbox/radio controls
- custom Vue controls

## Low priority

### Improve package version alignment

Current package versions do not all move together.

Options:

- keep package-local versions
- align all workspace package versions with root release tags

### Add CI

Target GitHub Actions:

```text
npm ci
npm run build
npm test
```
