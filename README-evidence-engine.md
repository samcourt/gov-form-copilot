# Evidence Engine patch

Copy these files into your repo root.

Then update `server/src/index.ts`:

```ts
import { profileRouter } from "./routes/profile.js";
```

and add:

```ts
app.use("/api", profileRouter);
```

Then run:

```powershell
npm run build --workspace=@gov-form-copilot/server
npm run dev:server
```

Test: http://localhost:8787/api/profile
