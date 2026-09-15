from __future__ import annotations

import argparse
import json
from dataclasses import replace
from pathlib import Path
from typing import Sequence

from .backends import DeterministicStubBackend, OllamaBackend
from .paths import package_root, require_safe_id
from .runtime import PortableMindRuntime, load_config


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the public text-only portable mind preview.")
    parser.add_argument(
        "--config",
        type=Path,
        default=package_root() / "config.example.json",
        help="strict JSON configuration file",
    )
    parser.add_argument("--profile", choices=("kira", "synthetic_robert"))
    parser.add_argument("--branch", help="local branch identifier")
    parser.add_argument("--data-dir", type=Path, help="local data directory")
    parser.add_argument("--backend", choices=("stub", "ollama"))
    parser.add_argument("--model", help="local Ollama model identifier")
    parser.add_argument("--once", help="run one text turn and exit")
    parser.add_argument("--status", action="store_true", help="print status and exit")
    return parser


def _runtime_from_args(args: argparse.Namespace) -> PortableMindRuntime:
    config = load_config(args.config)
    if args.profile:
        config = replace(config, profile_id=args.profile)
    if args.branch:
        config = replace(config, branch_id=require_safe_id(args.branch, label="branch identifier"))
    if args.data_dir:
        config = replace(config, data_dir=str(args.data_dir.resolve(strict=False)))
    backend_kind = args.backend or config.backend.get("kind")
    if backend_kind == "stub":
        backend = DeterministicStubBackend(profile_id=config.profile_id)
    elif backend_kind == "ollama":
        model = args.model or config.backend.get("model")
        if not model:
            raise ValueError("--model is required for the Ollama backend")
        backend = OllamaBackend(
            model=str(model),
            base_url=str(config.backend.get("base_url", "http://127.0.0.1:11434")),
            timeout_seconds=float(config.backend.get("timeout_seconds", 45)),
        )
    else:
        raise ValueError("unsupported backend")
    return PortableMindRuntime(config, backend=backend)


def _interactive(runtime: PortableMindRuntime) -> int:
    print(f"{runtime.profile.display_name} — public text-only preview")
    print("No bundled voice, private identity seed, body control, or official robot connection.")
    print("Commands: /status, /remember TEXT, /memories, /quit")
    runtime.start()
    try:
        while True:
            try:
                text = input("you> ").strip()
            except EOFError:
                break
            if not text:
                continue
            if text == "/quit":
                break
            if text == "/status":
                print(json.dumps(runtime.status(), indent=2, ensure_ascii=False))
                continue
            if text == "/memories":
                summaries = [item["summary"] for item in runtime.reviewed_memories()]
                print(json.dumps(summaries, indent=2, ensure_ascii=False))
                continue
            if text.startswith("/remember "):
                record = runtime.remember(text[len("/remember ") :])
                print(f"saved reviewed summary {record['memory_id']} to this branch")
                continue
            print(f"{runtime.profile.display_name}> {runtime.respond(text)}")
    finally:
        runtime.close()
    return 0


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    runtime = _runtime_from_args(args)
    if args.status:
        print(json.dumps(runtime.status(), indent=2, ensure_ascii=False))
        return 0
    if args.once:
        runtime.start()
        try:
            print(runtime.respond(args.once))
        finally:
            runtime.close()
        return 0
    return _interactive(runtime)
