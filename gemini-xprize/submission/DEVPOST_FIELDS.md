# Copy/paste Devpost fields

## Project name

Kira FounderOps

## Tagline

A Gemini-powered continuity agent that gives small businesses an evidence-grounded operating brief and a human approval trail.

## Category

Small Business Services

## Inspiration

Solo founders and small businesses lose important decisions, deadlines, and customer signals across scattered notes. They need operating continuity, but they often cannot afford a dedicated operations team.

## What it does

Kira FounderOps accepts a business objective, messy notes, known metrics, and real customer signals. A live Gemini agent returns a structured executive summary, evidence-backed decisions, risks, next actions, an outreach draft, and explicit unknowns. Every run is logged, and a separate human approval step records whether the founder accepts the plan.

## How we built it

Python, Flask, Gemini API structured JSON output, local JSONL audit logs, optional Cloud Firestore, and a Cloud Run-ready container. The UI is a responsive single-page dashboard. Gemini performs synthesis and drafting; the human verifies facts and approves the action plan.

## Challenges

The central challenge was preventing an operations agent from inventing the traction a founder wishes they had. The prompt, schema, evidence fields, unknowns list, logs, and approval gate are designed to make missing information visible.

## Accomplishments

- Live Gemini call in the operating workflow
- Structured decisions with evidence and confidence
- Risk and next-action generation
- Execution metadata and durable logs
- Human approval trail
- Cloud Run and Firestore deployment path

## What we learned

AI-native operations need more than a final answer. They need evidence, explicit uncertainty, logs, and a human decision surface.

## What's next

Deploy a small pilot with real founders, measure time saved and missed actions prevented, add consent-based connectors, and test a simple subscription model.

## Built with

Gemini API, Google Cloud Run, Cloud Firestore, Python, Flask, Docker, HTML, CSS, JavaScript

## Repository

https://github.com/rmcmurrer81/Kira/tree/gemini-xprize-kira-founderops/gemini-xprize
