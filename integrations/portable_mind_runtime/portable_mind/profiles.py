from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .paths import package_root, require_safe_id
from .strict_json import load_path_strict


class ProfileError(ValueError):
    pass


@dataclass(frozen=True)
class PublicProfile:
    profile_id: str
    display_name: str
    description: str
    identity_notice: str
    conversational_style: tuple[str, ...]
    values: tuple[str, ...]
    boundaries: tuple[str, ...]

    def prompt_view(self) -> dict[str, Any]:
        return {
            "profile_id": self.profile_id,
            "display_name": self.display_name,
            "description": self.description,
            "identity_notice": self.identity_notice,
            "conversational_style": list(self.conversational_style),
            "values": list(self.values),
            "boundaries": list(self.boundaries),
        }


def profiles_dir() -> Path:
    return package_root() / "profiles"


def _nonempty_text(value: Any, field: str, *, maximum: int = 2_000) -> str:
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise ProfileError(f"profile field {field} must be bounded non-empty text")
    return value.strip()


def load_profile(profile_id: str, root: Path | None = None) -> PublicProfile:
    try:
        selected_id = require_safe_id(profile_id, label="profile identifier")
    except ValueError as exc:
        raise ProfileError(str(exc)) from exc
    source = (root or profiles_dir()) / f"{selected_id}.json"
    try:
        raw = load_path_strict(source)
    except FileNotFoundError as exc:
        raise ProfileError(f"unknown profile: {selected_id}") from exc
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise ProfileError(f"profile {selected_id} is not strict valid JSON") from exc
    expected = {
        "schema_version",
        "profile_id",
        "display_name",
        "description",
        "identity_notice",
        "conversational_style",
        "values",
        "boundaries",
    }
    if not isinstance(raw, dict) or set(raw) != expected:
        raise ProfileError(f"profile {selected_id} has an unexpected schema")
    if raw["schema_version"] != 1 or raw["profile_id"] != selected_id:
        raise ProfileError(f"profile {selected_id} identity mismatch")
    lists: dict[str, tuple[str, ...]] = {}
    for field in ("conversational_style", "values", "boundaries"):
        value = raw[field]
        if not isinstance(value, list) or not (1 <= len(value) <= 16):
            raise ProfileError(f"profile field {field} must be a bounded list")
        lists[field] = tuple(_nonempty_text(item, field, maximum=300) for item in value)
    return PublicProfile(
        profile_id=selected_id,
        display_name=_nonempty_text(raw["display_name"], "display_name", maximum=80),
        description=_nonempty_text(raw["description"], "description"),
        identity_notice=_nonempty_text(raw["identity_notice"], "identity_notice"),
        conversational_style=lists["conversational_style"],
        values=lists["values"],
        boundaries=lists["boundaries"],
    )


def available_profiles(root: Path | None = None) -> tuple[str, ...]:
    directory = root or profiles_dir()
    return tuple(sorted(path.stem for path in directory.glob("*.json")))
