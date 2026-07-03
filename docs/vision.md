# Vision

> Helping people complete complex government forms with confidence.

---

# Why this project exists

Government forms are often one of the most stressful interactions people have.

Parents enrolling a child in school, citizens applying for benefits, people dealing with health, immigration or licensing all face the same problems:

- the information already exists somewhere
- they don't know which documents are needed
- they repeatedly enter the same information
- they worry about making mistakes
- they don't understand why a question is being asked
- they lose confidence that they have completed the form correctly

Today, the burden sits almost entirely with the citizen.

Gov Form Copilot shifts that burden to software.

Not by taking control away from the user, but by acting as an intelligent assistant that understands both the form and the evidence available.

---

# Vision

Create an AI assistant that can understand:

- documents
- people
- government forms
- evidence
- policy

and help users complete forms accurately while remaining completely transparent and under human control.

The assistant should behave more like an experienced case worker than an autofill tool. It should never know more than the evidence supports, and the user should always know more than the assistant assumes.

---

# Core Principles

## Human in control

The user always decides.

The assistant may:

- suggest
- explain
- highlight
- warn

The assistant never:

- submits forms
- bypasses authentication
- completes declarations
- makes legal decisions
- fabricates information

---

## Evidence before AI

AI should reason over trusted evidence.

Never over guesses.

Every suggested value should be traceable back to one or more documents.

The assistant should always be able to answer:

> "Why did you suggest this?"

---

## Explainability

Every recommendation should include:

- confidence
- reasoning
- supporting documents
- conflicting evidence (if any)

Users should never need to "trust the AI".

The AI should earn trust through transparency.

---

## Privacy by design

Personal documents remain under the user's control.

Where possible:

- processing occurs locally
- only minimum required information is transmitted
- documents are not retained unnecessarily
- users can inspect every piece of stored information

---

## Government-agnostic

The platform should not be designed specifically for one government agency.

Instead it should understand:

- pages
- questions
- evidence
- policies

allowing it to adapt to many government services.

---

## Accessibility

The assistant should reduce cognitive load.

It should:

- simplify language
- explain terminology
- identify missing evidence
- guide users through unfamiliar processes

---

# Product Vision

The browser extension is only the user interface.

The real product is an evidence-driven reasoning platform.

```
                Browser Extension
                        │
                        ▼
             Form Understanding Engine
                        │
                        ▼
              AI Reasoning Engine
                        │
                        ▼
               Canonical Profile
                        │
                        ▼
                Evidence Engine
                        │
                        ▼
             Document Extraction Engine
```

---

# User Experience

The ideal experience is:

1. Upload documents once.
2. Review extracted information.
3. Open any government form.
4. Receive suggested answers.
5. Review explanations.
6. Accept or edit each suggestion.
7. Submit with confidence.

---

# Long-term Goals

## For citizens

Reduce time, stress and mistakes.

## For government

Increase data quality.

Reduce incomplete applications.

Reduce manual review.

Increase trust.

## For software

Create reusable infrastructure that can support thousands of forms without hard-coded rules.

---

# Non-goals

The project is **not** intended to:

- replace human judgement
- impersonate users
- bypass MFA
- automate fraud
- submit applications without approval
- exploit websites
- scrape personal information without consent

---

# Success Measures

A successful assistant should:

- reduce completion time
- reduce data entry
- reduce rejected applications
- increase user confidence
- provide complete traceability
- remain usable by non-technical users

---

# Open Questions

## Product

- Is the primary customer:
  - citizens?
  - government agencies?
  - schools?
  - enterprise organisations?

- Should the product eventually become SaaS?

- Should it support offline operation?

---

## AI

- Should every suggestion come from an LLM?

- Which reasoning should remain deterministic?

- How should confidence be calculated?

- How should conflicting evidence be presented?

---

## Evidence

- How long should evidence be retained?

- Should users own their canonical profile?

- Should evidence be synchronised across devices?

---

## Browser

- Chrome only?

- Firefox?

- Edge?

- Mobile browsers?

---

## Documents

- OCR locally?

- OCR in the cloud?

- Which document types should become first-class citizens?

---

## Security

- Should encryption occur at rest?

- End-to-end encryption?

- Zero-knowledge architecture?

---

## Identity

- Should users authenticate?

- Or should everything remain local?

---

## Future

Could this evolve beyond forms?

Could the same evidence engine support:

- digital wallets
- benefit eligibility
- licence renewals
- travel
- taxation
- healthcare
- insurance

without changing the underlying architecture?

---

# Questions for Sam

## Product

1. Is this primarily a **personal AI assistant**, or a platform that government agencies themselves could adopt?

2. Is your ambition to help with **any** form, or only government forms?

3. Is the browser extension the product, or just the first client of a broader platform?

## Trust

4. Should the assistant ever be allowed to auto-fill low-risk fields, or should every field require explicit approval?

5. Should the assistant proactively warn when evidence is inconsistent, even if the form doesn't expose that conflict?

## Profile

6. Is there a single canonical profile per person, or can a household have linked profiles (parents, children, guardians)?

7. How do you see changes over time? For example, if a family moves house, should the system retain historical addresses?

## Deployment

8. Is the long-term deployment model:
   - Local-first?
   - Hybrid?
   - Cloud-first?
   - Enterprise/on-premises?

## AI

9. Where do you see deterministic rules ending and LLM reasoning beginning?

10. If the AI isn't confident enough, what should it do? Ask the user? Highlight missing evidence? Decline to suggest?