"""Safe provider preflight checks for Kira Labs hackathon projects.

Default execution is local-only. Network checks require an explicit flag. The
program masks account, host, user, and ARN details and never prints secret values.
No phone call, purchase, booking, database mutation, or model generation occurs
unless the specifically named Google generation flag is used.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import provider_status

MASK = "***"


def package_available(import_name: str) -> bool:
    return importlib.util.find_spec(import_name) is not None


def mask_account_id(value: str | None) -> str | None:
    if not value:
        return None
    digits = re.sub(r"\D", "", value)
    return f"{MASK}{digits[-4:]}" if digits else MASK


def mask_arn(value: str | None) -> str | None:
    if not value:
        return None
    parts = value.split(":")
    return ":".join(parts[:5] + [MASK]) if len(parts) >= 6 else MASK


def mask_database_url(value: str) -> dict[str, Any]:
    parsed = urlparse(value)
    return {
        "scheme": parsed.scheme or None,
        "host": MASK if parsed.hostname else None,
        "port": parsed.port,
        "database": parsed.path.lstrip("/") or None,
        "username_present": bool(parsed.username),
        "password_present": bool(parsed.password),
    }


def local_status() -> dict[str, Any]:
    return {
        "provider_status": provider_status.status(),
        "optional_packages": {
            "boto3": package_available("boto3"),
            "strands": package_available("strands"),
            "google_genai": package_available("google.genai"),
            "google_adk": package_available("google.adk"),
            "psycopg": package_available("psycopg"),
            "calle": package_available("calle"),
        },
        "secret_values_printed": False,
        "network_call_performed": False,
    }


def aws_read_only() -> dict[str, Any]:
    try:
        import boto3
    except ImportError as exc:
        raise RuntimeError("Install AWS packages first: pip install boto3") from exc

    profile = os.environ.get("AWS_PROFILE", "").strip() or None
    region = os.environ.get("AWS_REGION", "").strip() or os.environ.get("AWS_DEFAULT_REGION", "").strip()
    if not region:
        raise RuntimeError("Set AWS_REGION, recommended value: us-east-1")
    session = boto3.Session(profile_name=profile, region_name=region)
    identity = session.client("sts").get_caller_identity()
    models = session.client("bedrock", region_name=region).list_foundation_models()
    summaries = models.get("modelSummaries", [])
    return {
        "check": "AWS_STS_AND_BEDROCK_LIST_READ_ONLY",
        "region": region,
        "profile_name": profile or "default credential chain",
        "account": mask_account_id(str(identity.get("Account", ""))),
        "arn": mask_arn(str(identity.get("Arn", ""))),
        "bedrock_models_visible": len(summaries),
        "sample_model_ids": [str(row.get("modelId")) for row in summaries[:5]],
        "model_invoked": False,
        "resource_created": False,
        "secret_values_printed": False,
    }


def cockroach_read_only() -> dict[str, Any]:
    value = os.environ.get("DATABASE_URL", "").strip()
    if not value:
        raise RuntimeError("DATABASE_URL is not configured")
    try:
        import psycopg
    except ImportError as exc:
        raise RuntimeError('Install the driver first: pip install "psycopg[binary]"') from exc
    with psycopg.connect(value, connect_timeout=10) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT current_database(), current_user, version()")
            database, user, version = cursor.fetchone()
    return {
        "check": "COCKROACHDB_SELECT_READ_ONLY",
        "connection": mask_database_url(value),
        "database": str(database),
        "user": MASK if user else None,
        "version_prefix": str(version).split(" ", 2)[:2],
        "mutation_performed": False,
        "secret_values_printed": False,
    }


def call_e_local() -> dict[str, Any]:
    return {
        "check": "CALL_E_LOCAL_CONFIGURATION_ONLY",
        "api_key_configured": bool(os.environ.get("CALLE_API_KEY", "").strip()),
        "sdk_installed": package_available("calle"),
        "phone_call_placed": False,
        "network_call_performed": False,
        "secret_values_printed": False,
    }


def google_live() -> dict[str, Any]:
    if not (
        os.environ.get("GEMINI_API_KEY", "").strip()
        or os.environ.get("GOOGLE_API_KEY", "").strip()
    ):
        raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY is not configured")
    try:
        from google import genai
        from google.genai import types
    except ImportError as exc:
        raise RuntimeError('Install the SDK first: pip install "google-genai<3.0.0"') from exc
    model = os.environ.get("KIRA_TRUTHKEEPER_GEMINI_MODEL", "gemini-3.5-flash")
    with genai.Client() as client:
        response = client.models.generate_content(
            model=model,
            contents="Reply with exactly KIRA_GOOGLE_CONNECTIVITY_OK",
            config=types.GenerateContentConfig(temperature=0, max_output_tokens=20),
        )
    text = (getattr(response, "text", "") or "").strip()
    return {
        "check": "GOOGLE_MINIMAL_GENERATION",
        "model": model,
        "exact_expected_text": text == "KIRA_GOOGLE_CONNECTIVITY_OK",
        "response_preview": text[:80],
        "secret_values_printed": False,
        "note": "This flag performs one small model request and may count against quota or billing.",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--aws-read-only", action="store_true")
    parser.add_argument("--cockroach-read-only", action="store_true")
    parser.add_argument("--call-e-local", action="store_true")
    parser.add_argument("--google-live", action="store_true")
    args = parser.parse_args()

    output: dict[str, Any] = {"local": local_status()}
    try:
        if args.aws_read_only:
            output["aws"] = aws_read_only()
        if args.cockroach_read_only:
            output["cockroachdb"] = cockroach_read_only()
        if args.call_e_local:
            output["call_e"] = call_e_local()
        if args.google_live:
            output["google"] = google_live()
    except Exception as exc:
        output["error"] = {"type": type(exc).__name__, "message": str(exc)}
        print(json.dumps(output, indent=2, ensure_ascii=False))
        return 1
    print(json.dumps(output, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
