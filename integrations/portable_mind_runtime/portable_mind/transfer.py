from __future__ import annotations

import hashlib
import math
from pathlib import Path
from typing import Any

from .paths import require_safe_id
from .records import AppendOnlyJSONL, stable_event_id, utc_now
from .strict_json import canonical_json, load_path_strict


class TransferError(ValueError):
    pass


APPRAISAL_BOUNDS = {
    "valence": (-1.0, 1.0),
    "arousal": (0.0, 1.0),
    "engagement": (0.0, 1.0),
    "confidence": (0.0, 1.0),
}


def _digest_payload(payload: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_json(payload).encode("utf-8")).hexdigest()


def _validated_appraisal(value: dict[str, Any]) -> dict[str, float]:
    if not isinstance(value, dict) or set(value) != set(APPRAISAL_BOUNDS):
        raise TransferError("appraisal has an unexpected schema")
    result: dict[str, float] = {}
    for field, (minimum, maximum) in APPRAISAL_BOUNDS.items():
        raw = value[field]
        if isinstance(raw, bool) or not isinstance(raw, (int, float)):
            raise TransferError("appraisal values must be numbers")
        number = float(raw)
        if not math.isfinite(number) or not minimum <= number <= maximum:
            raise TransferError("appraisal value is outside its public range")
        result[field] = number
    return result


def _validated_memories(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list) or len(value) > 500:
        raise TransferError("reviewed memories must be a bounded list")
    result: list[dict[str, str]] = []
    for item in value:
        if not isinstance(item, dict) or set(item) != {"memory_id", "summary", "created_at"}:
            raise TransferError("reviewed memory has an unexpected schema")
        memory_id = require_safe_id(str(item["memory_id"]), label="memory identifier")
        summary = item["summary"]
        created_at = item["created_at"]
        if not isinstance(summary, str) or not summary.strip() or len(summary) > 2_000:
            raise TransferError("reviewed memory summary is invalid")
        if not isinstance(created_at, str) or not created_at.endswith("Z") or len(created_at) > 40:
            raise TransferError("reviewed memory timestamp is invalid")
        result.append(
            {"memory_id": memory_id, "summary": summary.strip(), "created_at": created_at}
        )
    return result


def _validate_payload(payload: Any) -> dict[str, Any]:
    expected = {
        "schema_version",
        "kind",
        "profile_id",
        "source_branch_id",
        "created_at",
        "reviewed_memories",
        "appraisal",
        "limitations",
    }
    if not isinstance(payload, dict) or set(payload) != expected:
        raise TransferError("unexpected transfer payload schema")
    if payload["schema_version"] != 1 or payload["kind"] != "public_text_only_branch_seed":
        raise TransferError("unsupported transfer bundle")
    require_safe_id(payload["profile_id"], label="profile identifier")
    require_safe_id(payload["source_branch_id"], label="branch identifier")
    if not isinstance(payload["created_at"], str) or not payload["created_at"].endswith("Z"):
        raise TransferError("transfer timestamp is invalid")
    if not isinstance(payload["limitations"], list) or not all(
        isinstance(item, str) and item.strip() for item in payload["limitations"]
    ):
        raise TransferError("transfer limitations must be explicit text")
    _validated_memories(payload["reviewed_memories"])
    _validated_appraisal(payload["appraisal"])
    return payload


def build_transfer_bundle(
    *,
    profile_id: str,
    source_branch_id: str,
    reviewed_memories: list[dict[str, Any]],
    appraisal: dict[str, float],
) -> dict[str, Any]:
    """Build a text-only, reviewable branch seed with no transcript."""

    require_safe_id(profile_id, label="profile identifier")
    require_safe_id(source_branch_id, label="branch identifier")
    safe_memories = _validated_memories(reviewed_memories)
    safe_appraisal = _validated_appraisal(appraisal)
    payload: dict[str, Any] = {
        "schema_version": 1,
        "kind": "public_text_only_branch_seed",
        "profile_id": profile_id,
        "source_branch_id": source_branch_id,
        "created_at": utc_now(),
        "reviewed_memories": safe_memories,
        "appraisal": safe_appraisal,
        "limitations": [
            "contains no transcript, voice, body state, or private identity seed",
            "import creates a divergent branch and is not an automatic merge",
        ],
    }
    return {"payload": payload, "sha256": _digest_payload(payload)}


def load_transfer_bundle(path: Path) -> dict[str, Any]:
    raw = load_path_strict(path)
    if not isinstance(raw, dict) or set(raw) != {"payload", "sha256"}:
        raise TransferError("unexpected transfer bundle schema")
    payload = _validate_payload(raw["payload"])
    if not isinstance(payload, dict) or raw["sha256"] != _digest_payload(payload):
        raise TransferError("transfer bundle digest mismatch")
    return raw


def import_transfer_bundle(
    bundle: dict[str, Any],
    *,
    destination_root: Path,
    expected_profile_id: str,
    destination_branch_id: str,
) -> int:
    payload = _validate_payload(bundle.get("payload"))
    if not isinstance(payload, dict) or bundle.get("sha256") != _digest_payload(payload):
        raise TransferError("transfer bundle digest mismatch")
    if payload.get("profile_id") != expected_profile_id:
        raise TransferError("transfer profile does not match destination")
    require_safe_id(destination_branch_id, label="branch identifier")
    if payload.get("source_branch_id") == destination_branch_id:
        raise TransferError("import must create a different branch")
    channel = AppendOnlyJSONL(destination_root / "reviewed_memories.jsonl")
    records: list[dict[str, Any]] = []
    for item in payload.get("reviewed_memories", []):
        memory_id = require_safe_id(str(item["memory_id"]), label="memory identifier")
        records.append(
            {
                "event_id": stable_event_id("imported_memory", destination_branch_id, memory_id),
                "event_type": "reviewed_memory",
                "memory_id": memory_id,
                "profile_id": expected_profile_id,
                "branch_id": destination_branch_id,
                "created_at": item["created_at"],
                "summary": item["summary"],
                "source": "reviewed_transfer_import",
            }
        )
    return channel.extend_once(records)
