"""Shared deterministic cores for the Kira Labs 2026 hackathon incubator.

The final submissions will be split into dedicated repositories and wrapped with
event-specific sponsor services. This module uses synthetic examples only and
contains no private Kira World data or live provider credentials.
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import asdict, dataclass
from datetime import date, datetime, timezone
from typing import Any, Iterable


def canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def digest(value: Any) -> str:
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def hash_chain(events: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    previous = "0" * 64
    output: list[dict[str, Any]] = []
    for sequence, event in enumerate(events, start=1):
        row = {"sequence": sequence, "previous_sha256": previous, "event": event}
        row["sha256"] = digest(row)
        output.append(row)
        previous = row["sha256"]
    return output


# ---------------------------------------------------------------------------
# Agents for Humans — Kira Memory Steward
# ---------------------------------------------------------------------------

CURRENT_WORDS = ("today", "right now", "currently", "just finished", "this week")


@dataclass(frozen=True)
class StewardRecord:
    record_id: str
    subject: str
    text: str
    occurred_at: datetime | None
    kind: str = "note"
    sensitive: bool = False
    approved_for_use: bool = False


def classify_steward_record(record: StewardRecord, *, now: datetime) -> dict[str, Any]:
    if record.sensitive and not record.approved_for_use:
        category, action, human = "PERMISSION_RESTRICTED", "ASK_PERMISSION", True
    elif record.kind == "draft":
        category, action, human = "DRAFT_OR_UNCONFIRMED", "KEEP_AS_DRAFT", True
    elif record.occurred_at is None:
        category, action, human = "UNDATED_CONTEXT", "REQUEST_DATE_OR_EXCLUDE", True
    else:
        age_days = max(0.0, (now - record.occurred_at).total_seconds() / 86400)
        stale = age_days > 30 and any(token in record.text.casefold() for token in CURRENT_WORDS)
        if stale:
            category, action, human = (
                "HISTORICAL_WITH_STALE_PRESENT_CLAIM",
                "RELABEL_AS_HISTORY",
                True,
            )
        elif age_days <= 30:
            category, action, human = "CURRENT_OR_RECENT", "ALLOW_IN_RECENT_VIEW", False
        else:
            category, action, human = "HISTORICAL", "PRESERVE_AS_HISTORY", False
    proposal_base = {
        "record_id": record.record_id,
        "action": action,
        "requires_human_decision": human,
    }
    return {
        "id": record.record_id,
        "subject": record.subject,
        "category": category,
        "proposal": {**proposal_base, "proposal_id": digest(proposal_base)[:20]},
    }


def memory_steward(records: Iterable[StewardRecord], *, now: datetime) -> dict[str, Any]:
    source = list(records)
    rows = [classify_steward_record(record, now=now) for record in source]
    return {
        "schema": "kira_memory_steward_report_v1",
        "source_records_mutated": False,
        "records": rows,
        "today": [row["id"] for row in rows if row["category"] == "CURRENT_OR_RECENT"],
        "human_decisions": [
            row["proposal"] for row in rows if row["proposal"]["requires_human_decision"]
        ],
        "audit": hash_chain(
            {
                "type": "CLASSIFICATION",
                "record_id": row["id"],
                "category": row["category"],
                "proposal_id": row["proposal"]["proposal_id"],
            }
            for row in rows
        ),
    }


# ---------------------------------------------------------------------------
# CALL-E — Kira AccessLine
# ---------------------------------------------------------------------------

E164 = re.compile(r"^\+[1-9]\d{7,14}$")
YES_PATTERN = re.compile(r"\b(yes|available|we do|there is|we have|accessible)\b", re.I)
NO_PATTERN = re.compile(r"\b(no|not available|we don't|we do not|there isn't|there is not)\b", re.I)
STOP_PATTERN = re.compile(r"\b(stop|do not call|don't call|not willing|no questions|remove us)\b", re.I)
UNKNOWN_PATTERN = re.compile(r"\b(unsure|not sure|don't know|do not know|maybe|depends)\b", re.I)


@dataclass(frozen=True)
class AccessCallPlan:
    venue: str
    phone: str
    purpose: str
    questions: tuple[str, ...]
    approved_at: datetime | None


def validate_access_plan(plan: AccessCallPlan, *, now: datetime, max_age_minutes: int = 60) -> None:
    if not plan.venue or not plan.purpose:
        raise ValueError("venue and purpose are required")
    if not E164.fullmatch(plan.phone):
        raise ValueError("phone must be E.164")
    if not plan.questions or len(plan.questions) > 10 or any(not item.strip() for item in plan.questions):
        raise ValueError("one to ten non-empty questions are required")
    if plan.approved_at is None:
        raise PermissionError("fresh user approval is required")
    minutes = (now - plan.approved_at).total_seconds() / 60
    if minutes < 0 or minutes > max_age_minutes:
        raise PermissionError("approval is future-dated or expired")


def classify_access_answer(text: str) -> str:
    value = " ".join(text.split())
    if not value:
        return "NO_ANSWER"
    if STOP_PATTERN.search(value):
        return "RECIPIENT_DECLINED"
    if UNKNOWN_PATTERN.search(value):
        return "UNKNOWN"
    yes, no = bool(YES_PATTERN.search(value)), bool(NO_PATTERN.search(value))
    if yes and no:
        return "AMBIGUOUS"
    if no:
        return "NO"
    if yes:
        return "YES"
    return "UNKNOWN"


def accessline_report(plan: AccessCallPlan, answers: list[str], *, called_at: datetime) -> dict[str, Any]:
    validate_access_plan(plan, now=called_at)
    if len(answers) > len(plan.questions):
        raise ValueError("more answers than planned questions")
    results = []
    for index, question in enumerate(plan.questions):
        answer = answers[index] if index < len(answers) else ""
        result = classify_access_answer(answer)
        results.append({"question": question, "answer": answer, "result": result})
        if result == "RECIPIENT_DECLINED":
            break
    return {
        "schema": "kira_accessline_report_v1",
        "disclosure": (
            "Hello. I am an automated accessibility assistant calling on behalf of a "
            f"visitor considering {plan.venue}. May I ask a few brief questions?"
        ),
        "results": results,
        "recipient_declined": bool(results and results[-1]["result"] == "RECIPIENT_DECLINED"),
        "booking_or_purchase_performed": False,
        "audio_retained": False,
    }


# ---------------------------------------------------------------------------
# CockroachDB × AWS — Kira Memory Ledger
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class LedgerRevision:
    memory_id: str
    revision: int
    subject: str
    text: str
    status: str
    visibility: str
    source_label: str
    supersedes_revision: int | None
    created_at: str
    previous_event_sha256: str
    event_sha256: str


class MemoryLedger:
    def __init__(self) -> None:
        self._events: list[LedgerRevision] = []

    @property
    def events(self) -> tuple[LedgerRevision, ...]:
        return tuple(self._events)

    def latest(self, memory_id: str) -> LedgerRevision | None:
        rows = [row for row in self._events if row.memory_id == memory_id]
        return max(rows, key=lambda row: row.revision) if rows else None

    def append(
        self,
        *,
        memory_id: str,
        subject: str,
        text: str,
        status: str,
        visibility: str,
        source_label: str,
        created_at: datetime,
    ) -> LedgerRevision:
        if status not in {"proposed", "accepted", "historical", "revoked"}:
            raise ValueError("invalid status")
        if visibility not in {"private", "shared", "public"}:
            raise ValueError("invalid visibility")
        previous_for_memory = self.latest(memory_id)
        base = {
            "memory_id": memory_id,
            "revision": 1 if previous_for_memory is None else previous_for_memory.revision + 1,
            "subject": subject,
            "text": text,
            "status": status,
            "visibility": visibility,
            "source_label": source_label,
            "supersedes_revision": previous_for_memory.revision if previous_for_memory else None,
            "created_at": created_at.astimezone(timezone.utc).isoformat(),
            "previous_event_sha256": self._events[-1].event_sha256 if self._events else "0" * 64,
        }
        row = LedgerRevision(event_sha256=digest(base), **base)
        self._events.append(row)
        return row

    def current_view(self) -> list[dict[str, Any]]:
        output = []
        for memory_id in sorted({row.memory_id for row in self._events}):
            row = self.latest(memory_id)
            if row and row.status != "revoked":
                output.append(asdict(row))
        return output

    def verify_chain(self) -> bool:
        previous = "0" * 64
        for row in self._events:
            payload = asdict(row)
            observed = payload.pop("event_sha256")
            if payload["previous_event_sha256"] != previous or digest(payload) != observed:
                return False
            previous = observed
        return True


# ---------------------------------------------------------------------------
# Open Atlas — Kira Safe Start Navigator
# ---------------------------------------------------------------------------

SAFE_START_CATEGORIES = {"housing", "transit", "benefits", "health", "safety", "accessibility", "education"}


@dataclass(frozen=True)
class SafeStartResource:
    resource_id: str
    name: str
    category: str
    summary: str
    official_url: str
    region: str
    last_verified: date


def safe_start_plan(
    resources: Iterable[SafeStartResource],
    *,
    requested_categories: set[str],
    region: str,
    today: date,
    max_age_days: int = 90,
) -> dict[str, Any]:
    if requested_categories - SAFE_START_CATEGORIES:
        raise ValueError("unknown category")
    current, stale = [], []
    for resource in resources:
        if not resource.official_url.startswith("https://"):
            raise ValueError("official_url must use https")
        if resource.category not in requested_categories or resource.region.casefold() != region.casefold():
            continue
        row = {**asdict(resource), "last_verified": resource.last_verified.isoformat()}
        row["source_sha256"] = digest(row)
        age = (today - resource.last_verified).days
        row["age_days"] = age
        (stale if age < 0 or age > max_age_days else current).append(row)
    return {
        "schema": "kira_safe_start_plan_v1",
        "uses_real_personal_data": False,
        "resources": current,
        "stale_resources": stale,
        "checklist": [
            {
                "category": category,
                "status": "FOUND" if any(row["category"] == category for row in current) else "NEEDS_RESEARCH",
            }
            for category in sorted(requested_categories)
        ],
        "disclaimer": "Source organizer only; not legal, medical, financial, or eligibility advice.",
    }


# ---------------------------------------------------------------------------
# All Things Agentic — Kira Project Truthkeeper
# ---------------------------------------------------------------------------

TRUTH_AUTHORITY = {"owner": 5, "current_registry": 4, "active_checkpoint": 3, "handoff": 2, "historical": 1}


@dataclass(frozen=True)
class TruthClaim:
    claim_id: str
    subject: str
    value: str
    effective_at: datetime
    authority: str
    state: str = "active"


def truthkeeper(claims: Iterable[TruthClaim]) -> dict[str, Any]:
    source = list(claims)
    grouped: dict[str, list[TruthClaim]] = {}
    for claim in source:
        if claim.authority not in TRUTH_AUTHORITY:
            raise ValueError("unknown authority")
        grouped.setdefault(claim.subject, []).append(claim)
    current, contradictions, history, proposals = {}, [], [], []
    for subject, rows in sorted(grouped.items()):
        eligible = [row for row in rows if row.state == "active"]
        if not eligible:
            history.extend({**asdict(row), "effective_at": row.effective_at.isoformat()} for row in rows)
            continue
        selected = max(
            eligible,
            key=lambda row: (TRUTH_AUTHORITY[row.authority], row.effective_at, row.claim_id),
        )
        current[subject] = {
            **asdict(selected),
            "effective_at": selected.effective_at.isoformat(),
        }
        values = sorted({row.value for row in eligible})
        if len(values) > 1:
            proposal = {
                "subject": subject,
                "selected_claim_id": selected.claim_id,
                "affected_claim_ids": sorted(row.claim_id for row in eligible if row != selected),
                "action": "CONFIRM_CURRENT_AND_MARK_OTHERS_SUPERSEDED",
            }
            proposal["proposal_id"] = digest(proposal)[:20]
            proposals.append(proposal)
            contradictions.append({"subject": subject, "values": values, "requires_human_review": True})
        history.extend({**asdict(row), "effective_at": row.effective_at.isoformat()} for row in rows if row != selected)
    return {
        "schema": "kira_project_truthkeeper_report_v1",
        "source_claims_mutated": False,
        "current_truth": current,
        "contradictions": contradictions,
        "proposals": proposals,
        "preserved_history": history,
        "audit": hash_chain(proposals),
    }


def demo_suite() -> dict[str, Any]:
    now = datetime(2026, 8, 10, 16, 15, tzinfo=timezone.utc)
    steward = memory_steward(
        [
            StewardRecord("recent", "project", "We discussed an accessibility prototype this week.", now),
            StewardRecord(
                "stale",
                "project",
                "I am currently finishing an old story.",
                datetime(2026, 5, 10, tzinfo=timezone.utc),
            ),
            StewardRecord("private", "private", "Synthetic private note.", None, sensitive=True),
        ],
        now=now,
    )
    access = accessline_report(
        AccessCallPlan(
            "Example Center",
            "+12125551234",
            "planning an accessible visit",
            ("Is there a step-free entrance?", "Is there an elevator?"),
            now,
        ),
        ["Yes.", "I am not sure."],
        called_at=now,
    )
    ledger = MemoryLedger()
    ledger.append(
        memory_id="m1",
        subject="project",
        text="Synthetic proposal.",
        status="proposed",
        visibility="private",
        source_label="synthetic",
        created_at=now,
    )
    ledger.append(
        memory_id="m1",
        subject="project",
        text="Synthetic accepted revision.",
        status="accepted",
        visibility="private",
        source_label="synthetic_decision",
        created_at=now,
    )
    safe = safe_start_plan(
        [
            SafeStartResource(
                "r1",
                "Example Housing Help",
                "housing",
                "Synthetic demonstration resource.",
                "https://example.org/housing",
                "Example City",
                date(2026, 8, 9),
            )
        ],
        requested_categories={"housing", "transit"},
        region="Example City",
        today=date(2026, 8, 10),
    )
    truth = truthkeeper(
        [
            TruthClaim("old", "model", "A", datetime(2026, 8, 1, tzinfo=timezone.utc), "historical"),
            TruthClaim("new", "model", "B", now, "current_registry"),
        ]
    )
    return {
        "memory_steward": steward,
        "accessline": access,
        "memory_ledger": {
            "events": [asdict(row) for row in ledger.events],
            "current_view": ledger.current_view(),
            "chain_valid": ledger.verify_chain(),
        },
        "safe_start": safe,
        "truthkeeper": truth,
    }
