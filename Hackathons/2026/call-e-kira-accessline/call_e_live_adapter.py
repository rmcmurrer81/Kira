"""Optional CALL-E SDK adapter for Kira AccessLine.

Importing this module is inert. A real phone call requires all of the following:

1. the official ``calle-ai`` package;
2. ``CALLE_API_KEY`` in the process environment;
3. a freshly approved AccessCallPlan;
4. ``execute=True`` supplied by the caller.

The local test suite never crosses that boundary and uses a fake client only.
"""

from __future__ import annotations

import os
from dataclasses import asdict
from datetime import datetime, timezone
from typing import Any, Protocol

from incubator_core import AccessCallPlan, validate_access_plan


class CallsAPI(Protocol):
    def create_and_wait(self, **kwargs: Any) -> Any: ...


class CalleClientLike(Protocol):
    calls: CallsAPI


def configured() -> bool:
    return bool(os.environ.get("CALLE_API_KEY", "").strip())


def result_schema(plan: AccessCallPlan) -> dict[str, Any]:
    properties = {
        f"answer_{index + 1}": {
            "type": "string",
            "enum": ["yes", "no", "unknown", "recipient_declined"],
            "description": question,
        }
        for index, question in enumerate(plan.questions)
    }
    return {
        "type": "object",
        "required": list(properties),
        "properties": properties,
        "additionalProperties": False,
    }


def build_task(plan: AccessCallPlan) -> str:
    questions = "\n".join(
        f"{index + 1}. {question}" for index, question in enumerate(plan.questions)
    )
    return (
        f"Call {plan.phone} regarding {plan.venue}. "
        "Identify yourself at the beginning as an automated accessibility assistant. "
        "Ask whether the recipient is willing to answer a few brief questions. "
        "Stop immediately if the recipient declines or asks not to continue. "
        "Do not book, purchase, change a reservation, impersonate the visitor, or infer an answer. "
        "Return yes, no, unknown, or recipient_declined for each question.\n\n"
        f"Purpose: {plan.purpose}\nQuestions:\n{questions}"
    )


def _default_client() -> CalleClientLike:
    key = os.environ.get("CALLE_API_KEY", "").strip()
    if not key:
        raise RuntimeError("CALLE_API_KEY is not configured")
    try:
        from calle import CalleClient
    except ImportError as exc:
        raise RuntimeError('Install the optional provider with: pip install "calle-ai==0.2.0"') from exc
    return CalleClient(api_key=key)


def place_approved_call(
    plan: AccessCallPlan,
    *,
    execute: bool = False,
    client: CalleClientLike | None = None,
    now: datetime | None = None,
) -> dict[str, Any]:
    """Place one approved call and return a normalized provider result.

    The explicit ``execute`` flag is deliberately separate from the plan's approval
    timestamp so a saved plan can never dial merely because it is loaded.
    """

    observed_now = now or datetime.now(timezone.utc)
    validate_access_plan(plan, now=observed_now)
    if not execute:
        raise PermissionError("real CALL-E execution requires execute=True")

    provider = client or _default_client()
    response = provider.calls.create_and_wait(
        task=build_task(plan),
        result_schema=result_schema(plan),
    )
    if isinstance(response, dict):
        raw = response
    else:
        raw = {
            key: getattr(response, key, None)
            for key in (
                "status",
                "task_completed",
                "completion_confidence",
                "structured_result",
                "evidence",
            )
        }
    return {
        "schema": "kira_accessline_calle_result_v1",
        "provider": "CALL-E",
        "phone_call_placed": True,
        "plan": {
            **asdict(plan),
            "approved_at": plan.approved_at.isoformat() if plan.approved_at else None,
        },
        "status": raw.get("status"),
        "task_completed": raw.get("task_completed"),
        "completion_confidence": raw.get("completion_confidence"),
        "structured_result": raw.get("structured_result"),
        "evidence": raw.get("evidence"),
        "audio_retained_by_kira_accessline": False,
    }
