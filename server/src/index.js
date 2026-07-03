import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

const profile = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/profile.json'), 'utf8'));
const evidence = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/evidence.json'), 'utf8'));

function getPath(obj, dottedPath) {
  return dottedPath.split('.').reduce((acc, key) => acc?.[key], obj);
}

function normalise(text = '') {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function formatValue(value, field) {
  if (!value) return value;
  const label = normalise(`${field.label} ${field.name}`);

  if (label.includes('date') || label.includes('birth')) {
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  }

  return value;
}

const RULES = [
  { path: 'student.givenName', terms: ['student given name', 'child given name', 'applicant given name', 'first name', 'given name'] },
  { path: 'student.familyName', terms: ['student family name', 'child family name', 'applicant family name', 'last name', 'surname', 'family name'] },
  { path: 'student.preferredName', terms: ['preferred name'] },
  { path: 'student.dateOfBirth', terms: ['student date of birth', 'child date of birth', 'date of birth', 'dob', 'birth date'] },
  { path: 'student.gender', terms: ['gender', 'sex'] },
  { path: 'parent.givenName', terms: ['parent given name', 'carer given name', 'guardian given name'] },
  { path: 'parent.familyName', terms: ['parent family name', 'carer family name', 'guardian family name'] },
  { path: 'parent.email', terms: ['email', 'email address'] },
  { path: 'parent.mobile', terms: ['mobile', 'phone', 'telephone', 'contact number'] },
  { path: 'address.line1', terms: ['address line 1', 'residential address', 'street address', 'home address'] },
  { path: 'address.suburb', terms: ['suburb', 'town'] },
  { path: 'address.state', terms: ['state'] },
  { path: 'address.postcode', terms: ['postcode', 'postal code'] },
  { path: 'address.country', terms: ['country'] }
];

function matchField(field) {
  const haystack = normalise(`${field.section || ''} ${field.label || ''} ${field.name || ''} ${field.fieldId || ''}`);

  let best = null;
  for (const rule of RULES) {
    for (const term of rule.terms) {
      const score = haystack.includes(normalise(term)) ? normalise(term).split(' ').length : 0;
      if (score > 0 && (!best || score > best.score)) {
        best = { ...rule, matchedTerm: term, score };
      }
    }
  }

  return best;
}

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'gov-form-copilot-server' });
});

import express from "express";
import cors from "cors";
import { suggestAnswers } from "./pipelines/suggestAnswers.js";

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/suggestions", async (req, res) => {
  try {
    const { fields } = req.body;

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        error: "Request body must include fields array"
      });
    }

    const suggestions = await suggestAnswers(fields);

    res.json({
      ok: true,
      suggestions
    });
  } catch (error) {
    console.error("Suggestion error:", error);

    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Gov Form Copilot server running on http://localhost:${PORT}`);
});

/*app.post('/suggest', (req, res) => {
  const pageModel = req.body;
  const suggestions = {};

  for (const field of pageModel.fields || []) {
    if (!field.safeToFill) continue;

    const match = matchField(field);
    if (!match) continue;

    const rawValue = getPath(profile, match.path);
    if (rawValue == null || rawValue === '') continue;

    const ev = evidence[match.path] || { source: 'Profile', confidence: 0.75 };

    suggestions[field.fieldId] = {
      value: formatValue(rawValue, field),
      confidence: ev.confidence,
      source: ev.source,
      profilePath: match.path,
      reason: `Matched field text to "${match.matchedTerm}".`
    };
  }

  res.json({ suggestions });
});*/

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Gov Form Copilot local API running at http://localhost:${port}`);
});
