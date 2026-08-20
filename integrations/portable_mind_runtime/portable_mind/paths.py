from __future__ import annotations

import os
import re
from pathlib import Path


SAFE_ID = re.compile(r"[a-z][a-z0-9_-]{0,63}")


def package_root() -> Path:
    return Path(__file__).resolve().parents[1]


def require_safe_id(value: str, *, label: str = "identifier") -> str:
    if not isinstance(value, str) or not SAFE_ID.fullmatch(value):
        raise ValueError(f"invalid {label}")
    return value


def default_data_root() -> Path:
    configured = os.environ.get("PORTABLE_MIND_HOME", "").strip()
    if configured:
        return Path(configured).expanduser().resolve(strict=False)
    if os.name == "nt" and os.environ.get("LOCALAPPDATA", "").strip():
        base = Path(os.environ["LOCALAPPDATA"])
    elif os.environ.get("XDG_STATE_HOME", "").strip():
        base = Path(os.environ["XDG_STATE_HOME"])
    else:
        base = Path.home() / ".local" / "state"
    return (base / "KiraPortableMind" / "public_runtime").resolve(strict=False)


def branch_root(data_root: Path, profile_id: str, branch_id: str) -> Path:
    profile = require_safe_id(profile_id, label="profile identifier")
    branch = require_safe_id(branch_id, label="branch identifier")
    root = data_root.expanduser().resolve(strict=False)
    selected = (root / profile / branch).resolve(strict=False)
    try:
        selected.relative_to(root)
    except ValueError as exc:
        raise ValueError("branch path escapes the data root") from exc
    return selected
