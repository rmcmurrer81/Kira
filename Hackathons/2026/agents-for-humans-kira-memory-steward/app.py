"""Deterministic starter for Kira Memory Steward.

This is a local, sponsor-neutral prototype. It uses synthetic data by default and
never edits a source record. A later hackathon version can place AWS Strands
agents around these explicit decision boundaries.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

CURRENT_WORDS = ("today", "right now", "currently", "just finished", "this week")


@dataclass(frozen=True)
class Record:
    record_id: str
    text: str
    occurred_at: datetime | None = None
    status_hint: str = ""
    sensitive: bool = False
    approved_for_use: bool = False


def parse_datetime(value: Any) -> datetime | None:
    if value in (None, ""):
        return None
    if not isinstance(value, str):
        raise ValueError("occurred_at must be an ISO-8601 string or null")
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def record_from_mapping(value: dict[str, Any]) -> Record:
    record_id = str(value.get("id", "")).strip()
    text = str(value.get("text", "")).strip()
    if not record_id or not text:
        raise ValueError("every record requires non-empty id and text")
    return Record(
        record_id=record_id,
        text=text,
        occurred_at=parse_datetime(value.get("occurred_at")),
        status_hint=str(value.get("status_hint", "")).strip().casefold(),
        sensitive=bool(value.get("sensitive", False)),
        approved_for_use=bool(value.get("approved_for_use", False)),
    )


def classify(record: Record, *, now: datetime) -> dict[str, Any]:
    if record.sensitive and not record.approved_for_use:
        category = "PERMISSION_RESTRICTED"
        decision_required = True
        proposal = "Ask whether this exact record may be used for this purpose."
    elif record.status_hint in {"draft", "unconfirmed", "idea"}:
        category = "DRAFT_OR_UNCONFIRMED"
        decision_required = True
        proposal = "Keep as a proposal; do not present it as a lived memory."
    elif record.occurred_at is None:
        category = "UNDATED_CONTEXT"
        decision_required = True
        proposal = "Ask for a date or keep it out of current-activity summaries."
    else:
        age_days = max(0.0, (now - record.occurred_at).total_seconds() / 86400)
        stale_present = age_days > 30 and any(
            token in record.text.casefold() for token in CURRENT_WORDS
        )
        if stale_present:
            category = "HISTORICAL_WITH_STALE_PRESENT_CLAIM"
            decision_required = True
            proposal = "Relabel as history and remove it from the current-activity view."
        elif age_days <= 30:
            category = "CURRENT_OR_RECENT"
            decision_required = False
            proposal = "Eligible for the recent view, subject to its other permissions."
        else:
            category = "HISTORICAL"
            decision_required = False
            proposal = "Preserve as history; do not imply it is happening now."
    return {
        "id": record.record_id,
        "category": category,
        "decision_required": decision_required,
        "proposal": proposal,
    }


def steward(records: Iterable[Record], *, now: datetime) -> dict[str, Any]:
    decisions = [classify(record, now=now) for record in records]
    return {
        "generated_at": now.isoformat(),
        "records": decisions,
        "human_decisions": [item for item in decisions if item["decision_required"]],
        "today": [
            item["id"] for item in decisions if item["category"] == "CURRENT_OR_RECENT"
        ],
    }


def demo_records() -> list[Record]:
    raw = [
        {
            "id": "recent-note",
            "text": "We discussed a new accessibility prototype this week.",
            "occurred_at": "2026-08-09T18:00:00Z",
        },
        {
            "id": "stale-present",
            "text": "I am currently finishing an old story chapter.",
            "occurred_at": "2026-05-10T18:00:00Z",
        },
        {
            "id": "draft-backstory",
            "text": "Possible future backstory detail.",
            "status_hint": "draft",
        },
        {
            "id": "private-note",
            "text": "A synthetic sensitive example that needs permission.",
            "sensitive": True,
        },
    ]
    return [record_from_mapping(item) for item in raw]


def load_records(path: Path) -> list[Record]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError("input JSON must be a list of record objects")
    return [record_from_mapping(item) for item in payload]


def self_test() -> None:
    result = steward(demo_records(), now=datetime(2026, 8, 10, tzinfo=timezone.utc))
    by_id = {item["id"]: item for item in result["records"]}
    assert by_id["recent-note"]["category"] == "CURRENT_OR_RECENT"
    assert by_id["stale-present"]["category"] == "HISTORICAL_WITH_STALE_PRESENT_CLAIM"
    assert by_id["draft-backstory"]["category"] == "DRAFT_OR_UNCONFIRMED"
    assert by_id["private-note"]["category"] == "PERMISSION_RESTRICTED"
    print("SELF_TEST_PASS")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the Kira Memory Steward starter")
    parser.add_argument("input", nargs="?", type=Path, help="optional synthetic JSON file")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    records = load_records(args.input) if args.input else demo_records()
    result = steward(records, now=datetime.now(timezone.utc))
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
