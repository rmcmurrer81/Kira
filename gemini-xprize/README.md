# Kira FounderOps

**Build with Gemini XPRIZE prototype — Small Business Services**

Kira FounderOps is a Gemini-powered continuity agent for solo founders and small businesses. It turns messy operating notes into an evidence-grounded brief containing decisions, risks, next actions, unknowns, and a draft outreach message. It logs every live agent run and requires a human approval step before the action plan is treated as approved.

This project is intentionally narrow. It applies Kira Labs' continuity research—reviewable memory, evidence, and permissioned action—to a practical small-business workflow.

## What is live

- A Flask web application with a founder input dashboard.
- A live Gemini API call for every generated operating brief.
- Structured JSON output with decisions, evidence, risks, and next actions.
- Local JSONL execution logs, including Gemini model and token metadata.
- Optional Firestore logging when deployed on Google Cloud.
- A separate human-approval endpoint and approval log.
- A Cloud Run-ready Dockerfile.

## Important truthfulness note

Kira Labs is early-stage. This repository does **not** claim paying customers or product revenue that do not exist. The submission templates include explicit places to report `$0` and to add only real customer evidence. Do not fabricate testimonials, revenue, or production usage.

## Run locally

1. Create a Gemini API key in Google AI Studio.
2. Clone the repository and enter this folder.
3. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
```

4. Set the API key:

```bash
# Windows PowerShell
$env:GEMINI_API_KEY="YOUR_KEY"
$env:GEMINI_MODEL="gemini-3.6-flash"

# macOS/Linux
export GEMINI_API_KEY="YOUR_KEY"
export GEMINI_MODEL="gemini-3.6-flash"
```

5. Start the app:

```bash
python app.py
```

6. Open `http://localhost:8080` and use **Load Kira Labs sample**.

## Deploy to Google Cloud Run

A Cloud Run deployment satisfies the Google Cloud infrastructure portion of the project. In the Google Cloud CLI, from this directory:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
gcloud run deploy kira-founderops \
  --source . \
  --region us-east1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=gemini-3.6-flash,FIRESTORE_ENABLED=false \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

Create the Secret Manager secret first, or temporarily use `--set-env-vars GEMINI_API_KEY=...` for a short-lived demo. Secret Manager is safer.

### Optional Firestore logging

Create a Firestore database in the same project and deploy with:

```bash
gcloud run services update kira-founderops \
  --region us-east1 \
  --set-env-vars FIRESTORE_ENABLED=true,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
```

The Cloud Run service identity needs permission to write to Firestore.

## API endpoints

- `GET /api/health` — configuration and health status.
- `POST /api/brief` — live Gemini operating brief.
- `POST /api/approve` — records human approval; does not execute external actions.

## Suggested three-minute demo flow

1. Show the Cloud Run URL or local app.
2. Load the Kira Labs sample.
3. Run the live Gemini agent.
4. Point to decisions, evidence, risks, next actions, and unknowns.
5. Show the model/token metadata and `agent_runs.jsonl` or Firestore document.
6. Click **Human approve action plan** and show the approval record.
7. State honestly that Kira Labs has `$0` product revenue and no external paying customers yet, if that remains true.

## Repository layout

- `app.py` — Gemini call, structured output, logging, approval gate.
- `templates/index.html` — responsive dashboard.
- `submission/` — Devpost narrative, video script, P&L template, evidence checklist.

## Security

- Never commit a Gemini API key.
- Use only non-sensitive demo inputs in a public deployment.
- This prototype has no authentication and is not ready for private company data.
- Human approval records a decision but does not send email or modify external systems.

## License

MIT License. See `LICENSE`.
