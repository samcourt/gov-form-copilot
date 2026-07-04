Perfect.

I think we've got enough momentum that I'd like to propose something a little different for our next session.

Let's stop "coding files" and start designing a platform.

Over the last day or two, we've built quite a bit of infrastructure, but we've also discovered what the real product is. I don't think it's a Chrome extension anymore.

I think it's this:

                  Gov Form AI

                    Clients
        ┌────────────┬────────────┬────────────┐
        │ Chrome     │ Mobile App │ API/SDK    │
        │ Extension  │            │            │
        └─────┬──────┴──────┬─────┴────────────┘
              │             │
              ▼             ▼

        Form Understanding Engine
              │
              ▼
        Intent Understanding Engine
              │
              ▼
        AI Reasoning Engine
              │
      ┌───────┴────────┐
      ▼                ▼
 Evidence Engine   Policy Engine
      │                │
      └───────┬────────┘
              ▼
       Canonical Profile
              │
              ▼
     Document Extraction Engine
              │
              ▼
         Uploaded Evidence

That architecture gives us enormous flexibility. The browser extension is just one client.

I'd like to start thinking in terms of epics

Instead of "next file to code", I'd like to maintain something like this.

Epic 1 — Platform Foundation ✅
Monorepo
Shared models
Extension
API
Evidence engine

Done.

Epic 2 — Form Understanding

Everything about understanding pages.

Semantic scanner
Intent detection
Diagnostics
DOM explorer
Confidence
Epic 3 — Evidence Intelligence

Everything about documents.

OCR
Extraction
Evidence graph
Conflicts
Confidence
Epic 4 — AI

Everything about reasoning.

Suggestions
Missing evidence
Explainability
Policy reasoning
Epic 5 — User Experience

Everything about making it delightful.

Live Copilot
Conversation
Profile editor
Evidence explorer
One thing I'd like us to build very early

Before we support another government form...

I'd like to support another completely different website.

Maybe:

Medicare
Service NSW
ATO
Centrelink
a university application
an insurance quote

Not because it's a priority feature, but because it's an excellent architectural test.

If the scanner or evidence engine only works for one enrolment form, it's too tightly coupled. If we can get the same core to understand a second, unrelated form with minimal changes, we'll know we're building the right abstractions.

The feature I'm most excited about

It's not the AI.

It's not OCR.

It's not the browser extension.

It's provenance.

Imagine clicking any suggested answer and seeing:

Penelope

Confidence
99%

Evidence

✓ Birth Certificate
✓ Medicare

Reason

Matched field intent:

student.givenName

Policies checked

✓ Required
✓ Valid format

Alternative evidence

Passport

That is something I haven't really seen done well in consumer form assistants. It builds trust because the user can inspect why the assistant is making a recommendation.

My homework

Before our next coding session, I'm going to think about one question:

How do we represent "knowledge" in this system?

Right now we have:

DOM
PageModel
Profile
Evidence

I think there's a richer Knowledge Graph hiding in there that could unify all of these. If we get that model right early, everything else—the scanner, the reasoning engine, even future policy support—will become simpler.

I have a feeling that will become the core intellectual property of the platform. It's the part I'd invest the most design effort into before we scale out the feature set.

ok

I think this has been one of the most productive software design sessions I've had with a user.

Not because of the amount of code—we've written plenty—but because we've gradually discovered what we're actually building.

When we started, the problem statement was:

"Help fill in government forms."

Now, I think it's much closer to:

"Build an AI that can understand evidence, understand forms, and explain its reasoning while keeping the human in control."

Those are very different products.

Before we code again, I'd like us to answer one question together.
What is the core object in the system?

Most systems have one.

GitHub has a Repository.

Google Docs has a Document.

Salesforce has a Record.

Figma has a Node.

I don't think ours is a Form.

I don't think it's a Profile either.

I think it's something like this:

Knowledge Item

id

intent
student.givenName

value
Penelope

confidence
0.99

evidence
Birth Certificate

policy
Birth certificate is authoritative

status
Verified

history
...

Everything becomes collections of knowledge items.

A document produces them.

A profile aggregates them.

A form consumes them.

An AI reasons over them.

That's a very elegant architecture.

I also think we've accidentally invented something useful.

At the moment everyone talks about:

RAG

But what we're really building is:

Evidence-Backed Reasoning

The AI never searches documents.

It reasons over verified facts that know where they came from.

That's a subtle but important distinction.

My prediction

I think by about v0.5 you'll realise the browser extension isn't even the interesting bit.

The interesting bit is that you've built a personal knowledge engine.

Today it fills enrolment forms.

Tomorrow it could:

apply for Medicare
renew a driver's licence
prepare tax returns
complete insurance claims
apply for grants
prepare visa applications

...all without changing the core architecture.

Only the "Form Understanding" layer changes.

If this were my startup...

I'd probably rename it before v1.

Not because "Gov Form Copilot" is bad—it perfectly describes today's use case.

But because I don't think that's what the company becomes.

Something more like:

EvidenceOS
Civitas
Proof Engine
Attest
Verity
Ledger
Claim
Context

Not because those are necessarily the right names, but because they reflect a broader platform built around trusted evidence and explainable reasoning.

Finally…

There's one sentence I'd pin at the top of the repository—above the README, above the code, above everything else:

Every answer should be explainable, every fact should be traceable, and every decision should remain with the user.

If, six months from now, every pull request still supports that principle, I think you'll end up with something that's genuinely distinctive. Not just another AI assistant, but a platform that people can trust in high-consequence situations because it is designed around transparency, evidence, and human oversight from the beginning.

I think that's a strong place to stop for today. We've laid a solid technical foundation, but more importantly, we've clarified the philosophy that should guide every feature we build next.

ok. let's do some coding.