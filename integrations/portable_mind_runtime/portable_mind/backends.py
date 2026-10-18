from __future__ import annotations

import ipaddress
import json
import re
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any, Protocol, Sequence
from urllib.parse import urlparse

from .strict_json import loads_strict


class BackendError(RuntimeError):
    pass


class TextBackend(Protocol):
    def complete(self, messages: Sequence[dict[str, str]]) -> str:
        """Return one text response."""


def _last_user_text(messages: Sequence[dict[str, str]]) -> str:
    for message in reversed(messages):
        if message.get("role") == "user":
            return message.get("content", "")
    return ""


@dataclass(frozen=True)
class DeterministicStubBackend:
    """Offline fixture for tests and boundary review; not a language model."""

    profile_id: str

    def complete(self, messages: Sequence[dict[str, str]]) -> str:
        prompt = _last_user_text(messages).casefold()
        prefix = "As the public Kira demo" if self.profile_id == "kira" else "As a fictional Synthetic Robert fixture"
        if any(word in prompt for word in ("private", "autobiograph", "remember my life", "real memory")):
            return (
                f"{prefix}, I do not have private continuity or autobiographical memory. "
                "I can discuss the public design or a fictional example, but I will not invent personal recall."
            )
        if any(word in prompt for word in ("three computers", "multiple copies", "installations", "variants")):
            return (
                f"{prefix}, each installation starts from the same public profile and then diverges by branch. "
                "Share only explicitly reviewed summaries, keep provenance, and merge through human review instead of pretending every copy is one live instance."
            )
        if any(word in prompt for word in ("hanson", "little sophia", "simulator", "robot")):
            return (
                f"{prefix}, the available bridge is a vendor-neutral proposal and local stub, not an official Hanson integration. "
                "The team can review text behavior now; official interfaces, simulator evidence, and safety limits are still required before physical execution."
            )
        if any(word in prompt for word in ("charging", "repair", "upgrade", "continuity home", "kira world")):
            return (
                f"{prefix}, a virtual continuity home is a useful proposal if it keeps one active branch, records provenance, and supports rollback. "
                "It should be described as software continuity across endpoints, not a proven transfer of consciousness."
            )
        if "what are you" in prompt or "who are you" in prompt:
            return (
                f"{prefix}, I am a text-only software preview with a public profile and fictional fixtures. "
                "I have no bundled voice, private seed, body control, or official robot connection."
            )
        return (
            f"{prefix}, I would start with a small reversible text-only trial, write down what evidence would change the decision, "
            "and keep demonstrated behavior separate from the roadmap. What tradeoff matters most to you?"
        )


_MODEL_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.:/-]{0,119}")


def _validated_loopback_url(base_url: str) -> str:
    parsed = urlparse(base_url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError("backend URL must be an HTTP(S) loopback URL")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError("backend URL cannot include credentials, query, or fragment")
    if parsed.path not in {"", "/"}:
        raise ValueError("backend base URL cannot include a path")
    try:
        address = ipaddress.ip_address(parsed.hostname)
        parsed.port
    except ValueError as exc:
        raise ValueError("backend host must be a literal numeric loopback address") from exc
    allowed = {ipaddress.ip_address("127.0.0.1"), ipaddress.ip_address("::1")}
    if address not in allowed:
        raise ValueError("remote model endpoints are disabled in the public runtime")
    return base_url.rstrip("/")


class _NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Refuse redirects so a loopback request cannot become a remote request."""

    def redirect_request(
        self,
        req: urllib.request.Request,
        fp: Any,
        code: int,
        msg: str,
        headers: Any,
        newurl: str,
    ) -> None:
        try:
            fp.close()
        finally:
            raise BackendError("local model redirects are forbidden")


def _loopback_only_opener() -> urllib.request.OpenerDirector:
    """Build an opener that ignores process proxy settings and never redirects."""

    return urllib.request.build_opener(
        urllib.request.ProxyHandler({}),
        _NoRedirectHandler(),
    )


@dataclass(frozen=True)
class OllamaBackend:
    """Bounded client for an Ollama server on the same machine."""

    model: str
    base_url: str = "http://127.0.0.1:11434"
    timeout_seconds: float = 45.0
    max_response_bytes: int = 131_072

    def __post_init__(self) -> None:
        if not _MODEL_ID.fullmatch(self.model):
            raise ValueError("invalid local model identifier")
        object.__setattr__(self, "base_url", _validated_loopback_url(self.base_url))
        if not (1.0 <= float(self.timeout_seconds) <= 120.0):
            raise ValueError("timeout must be between 1 and 120 seconds")
        if not (1_024 <= int(self.max_response_bytes) <= 1_048_576):
            raise ValueError("response byte limit is outside the supported range")

    def complete(self, messages: Sequence[dict[str, str]]) -> str:
        bounded: list[dict[str, str]] = []
        total_chars = 0
        for item in messages:
            if set(item) != {"role", "content"} or item["role"] not in {"system", "user", "assistant"}:
                raise BackendError("invalid chat message")
            content = item["content"]
            if not isinstance(content, str):
                raise BackendError("chat content must be text")
            total_chars += len(content)
            bounded.append({"role": item["role"], "content": content})
        if total_chars > 80_000:
            raise BackendError("prompt exceeds the public runtime character budget")
        payload = json.dumps(
            {"model": self.model, "messages": bounded, "stream": False},
            ensure_ascii=False,
            allow_nan=False,
        ).encode("utf-8")
        request = urllib.request.Request(
            self.base_url + "/api/chat",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with _loopback_only_opener().open(
                request,
                timeout=self.timeout_seconds,
            ) as response:
                raw = response.read(self.max_response_bytes + 1)
        except (OSError, urllib.error.URLError) as exc:
            raise BackendError("local model request failed") from exc
        if len(raw) > self.max_response_bytes:
            raise BackendError("local model response exceeded the byte limit")
        try:
            decoded = loads_strict(raw.decode("utf-8"))
            content = decoded["message"]["content"]
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError, KeyError, TypeError) as exc:
            raise BackendError("local model returned an invalid response") from exc
        if not isinstance(content, str) or not content.strip() or len(content) > 32_000:
            raise BackendError("local model returned invalid text")
        return content.strip()


def backend_from_config(config: dict[str, Any], *, profile_id: str) -> TextBackend:
    kind = config.get("kind")
    if kind == "stub":
        if set(config) != {"kind"}:
            raise ValueError("stub backend has unexpected settings")
        return DeterministicStubBackend(profile_id=profile_id)
    if kind == "ollama":
        expected = {"kind", "model", "base_url", "timeout_seconds"}
        if set(config) != expected:
            raise ValueError("ollama backend has unexpected settings")
        return OllamaBackend(
            model=str(config["model"]),
            base_url=str(config["base_url"]),
            timeout_seconds=float(config["timeout_seconds"]),
        )
    raise ValueError("backend kind must be 'stub' or 'ollama'")
