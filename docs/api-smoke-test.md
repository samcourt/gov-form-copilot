# API Smoke Test

Use this after a merge or release tag to confirm the local API is healthy.

## Start server

```powershell
npm run dev:server
```

## Browser checks

Open:

```text
http://localhost:8787/health
http://localhost:8787/api/assets
http://localhost:8787/api/evidence
http://localhost:8787/api/profile
```

Expected:

- `/health` returns `{ ok: true }`
- `/api/assets` returns `{ ok: true, assets: [...] }`
- `/api/evidence` returns `{ ok: true, evidenceDocuments: [...] }`
- `/api/profile` returns `{ ok: true, profile: ... }`

## Ingest extracted text

```powershell
Invoke-RestMethod -Uri "http://localhost:8787/api/documents/extract-text" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    sourceType = "birth_certificate"
    label = "Smoke Test Birth Certificate"
    rawText = "Given Names: Penelope`nFamily Name: Court`nDate of Birth: 14/03/2017`nCountry of Birth: Australia"
  } | ConvertTo-Json)
```

Expected:

- `ok` is `True`
- `extractedFields` includes:
  - `student.givenName`
  - `student.familyName`
  - `student.dateOfBirth`
  - `student.countryOfBirth`

## Verify profile updated

Open:

```text
http://localhost:8787/api/profile
```

Expected:

- document count increases
- canonical profile includes the smoke test values

## Web app check

Start web:

```powershell
npm run dev:web
```

Open:

```text
http://localhost:5174
```

Expected:

- Dashboard loads
- Evidence page loads
- Profile page loads
- Upload page can ingest structured values
