from __future__ import annotations

import hashlib
import json
import os
import threading
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from .strict_json import canonical_json, loads_strict


class StorageCorruption(RuntimeError):
    pass


class ConcurrentMutationError(RuntimeError):
    pass


_LOCKS_GUARD = threading.Lock()
_LOCKS: dict[str, threading.RLock] = {}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def stable_event_id(*parts: str) -> str:
    return hashlib.sha256("\x1f".join(parts).encode("utf-8")).hexdigest()


def _thread_lock(path: Path) -> threading.RLock:
    key = str(path.resolve(strict=False)).casefold()
    with _LOCKS_GUARD:
        return _LOCKS.setdefault(key, threading.RLock())


@contextmanager
def exclusive_file_lock(path: Path, *, blocking: bool = True):
    """Cross-platform advisory lock for one-byte, content-free lock files."""

    selected = path.resolve(strict=False)
    selected.parent.mkdir(parents=True, exist_ok=True)
    lock = _thread_lock(selected)
    if not lock.acquire(blocking=blocking):
        raise ConcurrentMutationError(f"mutation lock is already held: {selected.name}")
    handle = None
    locked = False
    try:
        handle = selected.open("a+b")
        if handle.seek(0, os.SEEK_END) == 0:
            handle.write(b"\0")
            handle.flush()
            os.fsync(handle.fileno())
        handle.seek(0)
        try:
            if os.name == "nt":
                import msvcrt

                msvcrt.locking(
                    handle.fileno(),
                    msvcrt.LK_LOCK if blocking else msvcrt.LK_NBLCK,
                    1,
                )
            else:
                import fcntl

                fcntl.flock(
                    handle.fileno(),
                    fcntl.LOCK_EX | (0 if blocking else fcntl.LOCK_NB),
                )
            locked = True
        except (BlockingIOError, OSError) as exc:
            raise ConcurrentMutationError(
                f"mutation lock is already held: {selected.name}"
            ) from exc
        yield
    finally:
        if handle is not None:
            if locked:
                try:
                    handle.seek(0)
                    if os.name == "nt":
                        import msvcrt

                        msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
                    else:
                        import fcntl

                        fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
                except OSError:
                    pass
            handle.close()
        lock.release()


class AppendOnlyJSONL:
    """Strict append-only JSONL with duplicate-ID conflict detection."""

    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        self._process_lock = path.with_name(path.name + ".lock")

    def _records_unlocked(self) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        result: list[dict[str, Any]] = []
        seen: dict[str, str] = {}
        with self.path.open("r", encoding="utf-8") as handle:
            for line_number, line in enumerate(handle, start=1):
                if not line.strip():
                    continue
                try:
                    record = loads_strict(line)
                except (json.JSONDecodeError, ValueError) as exc:
                    raise StorageCorruption(
                        f"malformed JSON in {self.path.name} at line {line_number}"
                    ) from exc
                if not isinstance(record, dict) or not isinstance(record.get("event_id"), str):
                    raise StorageCorruption(
                        f"invalid record in {self.path.name} at line {line_number}"
                    )
                encoded = canonical_json(record)
                event_id = record["event_id"]
                if event_id in seen:
                    if seen[event_id] != encoded:
                        raise StorageCorruption(
                            f"conflicting event_id in {self.path.name} at line {line_number}"
                        )
                    continue
                seen[event_id] = encoded
                result.append(record)
        return result

    def records(self) -> list[dict[str, Any]]:
        with self._lock, exclusive_file_lock(self._process_lock):
            return self._records_unlocked()

    def append_once(self, record: dict[str, Any]) -> bool:
        event_id = record.get("event_id")
        if not isinstance(event_id, str) or not event_id:
            raise ValueError("append-only records require a non-empty event_id")
        encoded = canonical_json(record)
        with self._lock, exclusive_file_lock(self._process_lock):
            existing = next(
                (item for item in self._records_unlocked() if item["event_id"] == event_id),
                None,
            )
            if existing is not None:
                if canonical_json(existing) != encoded:
                    raise StorageCorruption(
                        f"conflicting content for event_id in {self.path.name}"
                    )
                return False
            with self.path.open("a", encoding="utf-8", newline="\n") as handle:
                handle.write(encoded + "\n")
                handle.flush()
                os.fsync(handle.fileno())
        return True

    def extend_once(self, records: Iterable[dict[str, Any]]) -> int:
        return sum(1 for record in records if self.append_once(record))

    def tail(self, count: int) -> list[dict[str, Any]]:
        if count < 0:
            raise ValueError("tail count cannot be negative")
        return self.records()[-count:] if count else []
