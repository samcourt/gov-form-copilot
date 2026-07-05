import cors from "cors";
import dotenv from "dotenv";
import express from "express";
//import suggestionsRouter from "./routes/suggestions.js";
import { suggestionsRouter } from "./routes/suggestions.js";
import { profileRouter } from "./routes/profile.js";
import { evidenceRouter } from "./routes/evidence.js";
import { documentsRouter } from "./routes/documents.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gov-form-copilot-server" });
});

//app.use("/api/suggestions", suggestionsRouter);
app.use("/api", suggestionsRouter);
app.use("/api", profileRouter);
app.use("/api", evidenceRouter);
app.use("/api", documentsRouter);

app.listen(port, () => {
  console.log(`Gov Form Copilot API running at http://localhost:${port}`);
});
