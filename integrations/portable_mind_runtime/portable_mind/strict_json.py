from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class StrictJSONError(ValueError):
    """JSON was ambiguous or contained a non-finite number."""


def _without_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise StrictJSONError(f"duplicate JSON object key: {key}")
        result[key] = value
    return result


def _reject_nonfinite(value: str) -> None:
    raise StrictJSONError(f"non-finite JSON number is forbidden: {value}")


def loads_strict(text: str) -> Any:
    return json.loads(
        text,
        object_pairs_hook=_without_duplicate_keys,
        parse_constant=_reject_nonfinite,
    )


def load_path_strict(path: Path) -> Any:
    return loads_strict(path.read_text(encoding="utf-8"))


def canonical_json(value: Any) -> str:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
    )
