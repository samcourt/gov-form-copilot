# Gov Form Copilot

AI-assisted browser copilot for completing complex government forms using verified personal information while keeping the user in control.

> ⚠️ Prototype
>
> This project is an experimental proof-of-concept. It does **not** bypass authentication or submit forms autonomously. Users remain responsible for login, MFA, declarations and final submission.

---

# Vision

See [Vision.md](Vision.md).

---

# Current Prototype

The current prototype demonstrates:

- Human-in-the-loop operation
- Form field discovery
- Mapping fields to a personal identity model (separate n8n workflow prototype)
- Evidence-backed answer suggestions
- User approval before data entry

Currently targeting:

- NSW Education Online Enrolment (eHub)

---

# Prerequisites

Install:

- Node.js 22+
- npm
- Docker Desktop (optional)
- Playwright browsers

Verify:

```bash
node --version
npm --version
```

---

# Installation

Clone the repository:

```bash
git clone <repo>
cd gov-form-copilot
```

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Copy the environment file:

```bash
cp .env.example .env
```

---

# Running

## 1. Analyse a page

```bash
npm run analyse
```

The browser opens.

1. Log in manually.
2. Complete MFA.
3. Return to the terminal.
4. Press Enter.

Outputs:

```
out/page-analysis.json
```

---

## 2. Generate proposed answers

```bash
npm run propose
```

Outputs:

```
out/proposed-values.json
```

---

## 3. Review approvals

Edit:

```
out/approvals.json
```

Approve or reject each proposed field.

---

## 4. Fill approved fields

```bash
npm run fill
```

The assistant fills only approved fields.

It will never automatically:

- enter passwords
- complete MFA
- tick legal declarations
- submit the form

---

# Project Structure

```
src/
    1-analyse-page.ts
    2-propose-answers.ts
    3-fill-approved-fields.ts

data/
    profile.json
    evidence/

out/
    page-analysis.json
    proposed-values.json
    approvals.json
```

---

# Design Principles

- Human in control
- Verified data
- Explainable AI
- Evidence-backed decisions
- No autonomous submission

---

# Roadmap

- [ ] Browser extension
- [ ] Better field understanding
- [ ] Identity graph
- [ ] Document verification integration
- [ ] Confidence scoring
- [ ] Evidence provenance
- [ ] Audit trail
- [ ] Support multiple government services

---

# Licence

TBD


## Current Status (v0.1)

### Working

- ✅ Chrome Extension
- ✅ Page scanning
- ✅ Field application
- ✅ Local API
- ✅ Shared TypeScript models
- ✅ Evidence Engine
- ✅ Canonical Profile generation
- ✅ Suggestion engine
- ✅ Architecture documentation

### In Progress

- 🔄 Rich semantic page understanding
- 🔄 Document ingestion
- 🔄 AI reasoning

### Planned

- 📋 Evidence explorer
- 📋 Multi-document conflict resolution
- 📋 Policy reasoning
- 📋 Conversation mode
