from __future__ import annotations

import hashlib
import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
DATA_DIR = Path(os.getenv("DATA_DIR", "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
FIRESTORE_ENABLED = os.getenv("FIRESTORE_ENABLED", "false").strip().lower() == "true"

OUTPUT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "executive_summary": {"type": "string"},
        "decisions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "decision": {"type": "string"},
                    "evidence": {"type": "string"},
                    "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
                },
                "required": ["decision", "evidence", "confidence"],
            },
        },
        "risks": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "risk": {"type": "string"},
                    "severity": {"type": "string", "enum": ["high", "medium", "low"]},
                    "evidence": {"type": "string"},
                    "mitigation": {"type": "string"},
                },
                "required": ["risk", "severity", "evidence", "mitigation"],
            },
        },
        "next_actions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "action": {"type": "string"},
                    "owner": {"type": "string"},
                    "deadline": {"type": "string"},
                    "why": {"type": "string"},
                    "requires_human_approval": {"type": "boolean"},
                },
                "required": ["action", "owner", "deadline", "why", "requires_human_approval"],
            },
        },
        "outreach_draft": {
            "type": "object",
            "properties": {"subject": {"type": "string"}, "body": {"type": "string"}},
            "required": ["subject", "body"],
        },
        "unknowns": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["executive_summary", "decisions", "risks", "next_actions", "outreach_draft", "unknowns"],
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def append_jsonl(filename: str, record: dict[str, Any]) -> None:
    path = DATA_DIR / filename
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def write_firestore(collection: str, document_id: str, record: dict[str, Any]) -> bool:
    if not FIRESTORE_ENABLED:
        return False
    try:
        from google.cloud import firestore

        client = firestore.Client()
        client.collection(collection).document(document_id).set(record)
        return True
    except Exception as exc:
        app.logger.warning("Firestore write failed: %s", exc)
        return False


def build_prompt(payload: dict[str, str]) -> str:
    return f"""
You are Kira FounderOps, an AI operations agent for a small business.
Your job is to turn messy founder notes into a grounded operating brief.

RULES:
1. Use only the information provided below. Never invent customers, revenue, dates, metrics, or commitments.
2. Clearly mark missing information as unknown.
3. Separate evidence from recommendations.
4. External communication and file-changing actions require human approval.
5. Be concise, practical, and suitable for a solo founder or very small team.
6. Do not provide legal, medical, tax, or investment advice.
7. Return only JSON matching the requested schema.

BUSINESS NAME:
{payload['business_name']}

CURRENT OBJECTIVE:
{payload['objective']}

FOUNDER NOTES:
{payload['notes']}

KNOWN METRICS:
{payload['metrics'] or 'No metrics supplied.'}

CUSTOMER OR USER SIGNALS:
{payload['customer_signals'] or 'No customer or user signals supplied.'}

Create an executive summary, evidence-backed decisions, risks, next actions,
a short outreach draft, and a list of unknowns that should be resolved.
""".strip()


def call_gemini(payload: dict[str, str]) -> tuple[dict[str, Any], dict[str, Any]]:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured. Create a key in Google AI Studio, "
            "then set it as an environment variable."
        )

    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    request_body = {
        "contents": [{"role": "user", "parts": [{"text": build_prompt(payload)}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2200,
            "responseMimeType": "application/json",
            "responseJsonSchema": OUTPUT_SCHEMA,
        },
    }
    response = requests.post(
        endpoint,
        headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
        json=request_body,
        timeout=90,
    )
    response.raise_for_status()
    response_json = response.json()

    try:
        text = response_json["candidates"][0]["content"]["parts"][0]["text"]
        result = json.loads(text)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        raise RuntimeError("Gemini returned an unexpected response format.") from exc

    metadata = {
        "model": response_json.get("modelVersion", MODEL),
        "response_id": response_json.get("responseId"),
        "usage": response_json.get("usageMetadata", {}),
    }
    return result, metadata


@app.get("/")
def index():
    return render_template("index.html", model=MODEL)


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "kira-founderops",
        "model": MODEL,
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
        "firestore_enabled": FIRESTORE_ENABLED,
    })


@app.post("/api/brief")
def create_brief():
    data = request.get_json(silent=True) or {}
    payload = {
        "business_name": str(data.get("business_name", "")).strip(),
        "objective": str(data.get("objective", "")).strip(),
        "notes": str(data.get("notes", "")).strip(),
        "metrics": str(data.get("metrics", "")).strip(),
        "customer_signals": str(data.get("customer_signals", "")).strip(),
    }
    missing = [key for key in ("business_name", "objective", "notes") if not payload[key]]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
    if len(payload["notes"]) > 12000:
        return jsonify({"error": "Founder notes must be 12,000 characters or fewer."}), 400

    try:
        result, gemini_metadata = call_gemini(payload)
    except requests.HTTPError as exc:
        detail = exc.response.text[:1000] if exc.response is not None else str(exc)
        return jsonify({"error": "Gemini API request failed.", "detail": detail}), 502
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    run_id = str(uuid.uuid4())
    record = {
        "run_id": run_id,
        "created_at": utc_now(),
        "input_sha256": hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest(),
        "input": payload,
        "output": result,
        "gemini": gemini_metadata,
        "human_approved": False,
    }
    append_jsonl("agent_runs.jsonl", record)
    firestore_saved = write_firestore("founderops_runs", run_id, record)

    return jsonify({
        "run_id": run_id,
        "created_at": record["created_at"],
        "result": result,
        "gemini": gemini_metadata,
        "storage": "firestore+local" if firestore_saved else "local-jsonl",
        "human_approved": False,
    })


@app.post("/api/approve")
def approve_action_plan():
    data = request.get_json(silent=True) or {}
    run_id = str(data.get("run_id", "")).strip()
    approved_note = str(data.get("approved_note", "")).strip()
    if not run_id:
        return jsonify({"error": "run_id is required."}), 400

    approval = {
        "run_id": run_id,
        "approved_at": utc_now(),
        "approved_note": approved_note or "Founder approved the generated action plan.",
        "approved_by": "human-founder",
    }
    append_jsonl("approved_actions.jsonl", approval)
    firestore_saved = write_firestore("founderops_approvals", run_id, approval)
    return jsonify({
        "status": "approved",
        "approval": approval,
        "storage": "firestore+local" if firestore_saved else "local-jsonl",
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG") == "1")
