# Testing

The first automated tests cover the Evidence Engine because it is the core of the product.

They verify:

- canonical profile generation
- evidence authority ranking
- conflict detection
- unsupported fields
- field flattening

Run:

```powershell
npm run test --workspace=@gov-form-copilot/server
```

Build plus tests:

```powershell
npm run build
npm run test --workspace=@gov-form-copilot/server
```

Next useful tests:

- Document ingestion route tests
- Evidence asset route tests
- Suggestion engine tests
- Scanner fixture tests
