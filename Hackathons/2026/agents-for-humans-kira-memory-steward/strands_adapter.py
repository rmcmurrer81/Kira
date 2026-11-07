"""Optional Strands Agents explanation layer for Memory Steward.

The deterministic classifier remains authoritative. The model may explain a
report, but it is not allowed to rewrite source memory or silently approve a
proposal. The default provider is the low-cost text-only Amazon Nova Micro model
in Amazon Bedrock; it is not called during import or local tests.
"""

from __future__ import annotations

import json
import os
from typing import Any, Callable

DEFAULT_MODEL_ID = os.environ.get(
    "KIRA_MEMORY_STEWARD_BEDROCK_MODEL",
    "amazon.nova-micro-v1:0",
)
DEFAULT_REGION = os.environ.get("AWS_REGION", "us-east-1")

SYSTEM_PROMPT = """You explain a deterministic memory-steward report.
Do not change categories, proposal IDs, permissions, or current/history status.
Do not claim a source memory was edited. Clearly list which decisions still
require the human. If evidence is missing, say it is unknown.
"""


def build_prompt(report: dict[str, Any]) -> str:
    return (
        "Explain this report in plain language. Preserve every factual field and "
        "end with a section named 'Decisions Robert must make'.\n\n"
        + json.dumps(report, indent=2, ensure_ascii=False)
    )


def default_agent() -> Any:
    """Create the explicit Bedrock-backed Strands agent.

    No model call occurs until the returned agent is invoked.
    """

    try:
        import boto3
        from strands import Agent
        from strands.models import BedrockModel
    except ImportError as exc:
        raise RuntimeError(
            "Install the AWS agent packages first: "
            "pip install strands-agents strands-agents-tools boto3"
        ) from exc

    profile = os.environ.get("AWS_PROFILE", "").strip() or None
    region = os.environ.get("AWS_REGION", "").strip() or DEFAULT_REGION
    session = boto3.Session(profile_name=profile, region_name=region)
    model = BedrockModel(
        model_id=DEFAULT_MODEL_ID,
        region_name=region,
        temperature=0.0,
        streaming=False,
        boto_session=session,
    )
    return Agent(model=model, system_prompt=SYSTEM_PROMPT)


def explain_report(
    report: dict[str, Any],
    *,
    agent_factory: Callable[..., Any] | None = None,
) -> str:
    agent = default_agent() if agent_factory is None else agent_factory(system_prompt=SYSTEM_PROMPT)
    response = agent(build_prompt(report))
    return str(response)


def configuration_summary() -> dict[str, Any]:
    """Return non-secret provider choices for diagnostics and Devpost evidence."""

    return {
        "framework": "Strands Agents SDK",
        "provider": "Amazon Bedrock",
        "model_id": DEFAULT_MODEL_ID,
        "region": os.environ.get("AWS_REGION", "").strip() or DEFAULT_REGION,
        "aws_profile_configured": bool(os.environ.get("AWS_PROFILE", "").strip()),
        "secret_values_printed": False,
        "model_invoked": False,
    }
