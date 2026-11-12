"""Report whether optional cloud credentials appear configured.

Only presence and format hints are reported. Secret values are never printed.
"""

from __future__ import annotations

import json
import os
from urllib.parse import urlparse


def present(*names: str) -> bool:
    return any(bool(os.environ.get(name, "").strip()) for name in names)


def status() -> dict[str, object]:
    database_url = os.environ.get("DATABASE_URL", "").strip()
    parsed = urlparse(database_url) if database_url else None
    return {
        "aws": {
            "configured": present("AWS_PROFILE") or (
                present("AWS_ACCESS_KEY_ID") and present("AWS_SECRET_ACCESS_KEY")
            ),
            "region_configured": present("AWS_REGION", "AWS_DEFAULT_REGION"),
            "needed_for": ["Agents for Humans", "CockroachDB x AWS"],
        },
        "google": {
            "developer_api_key_configured": present("GEMINI_API_KEY", "GOOGLE_API_KEY"),
            "enterprise_project_configured": present("GOOGLE_CLOUD_PROJECT")
            and present("GOOGLE_CLOUD_LOCATION"),
            "needed_for": ["All Things Agentic", "Agentic Cinema"],
        },
        "cockroachdb": {
            "configured": bool(parsed and parsed.scheme in {"postgres", "postgresql"} and parsed.hostname),
            "needed_for": ["CockroachDB x AWS"],
        },
        "call_e": {
            "configured": present("CALLE_API_KEY"),
            "needed_for": ["CALL-E"],
        },
        "safe_for_local_tests": True,
        "secret_values_printed": False,
    }


if __name__ == "__main__":
    print(json.dumps(status(), indent=2))
