from __future__ import annotations

import argparse
import ast
import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_NAME = "PUBLIC_RELEASE_MANIFEST.sha256"

EXPECTED_FILES = frozenset(
    {
        ".gitignore",
        "LICENSE",
        "PUBLIC_RELEASE_MANIFEST.sha256",
        "README.md",
        "RUN_THIS_FIRST.md",
        "config.example.json",
        "evaluation/public_safe_cases.json",
        "launchers/Kira Text Only Chat.cmd",
        "launchers/Synthetic Robert Text Only Chat.cmd",
        "launchers/kira_text_only.sh",
        "launchers/synthetic_robert_text_only.sh",
        "portable_mind/__init__.py",
        "portable_mind/__main__.py",
        "portable_mind/backends.py",
        "portable_mind/cli.py",
        "portable_mind/embodiment.py",
        "portable_mind/life_loops.py",
        "portable_mind/paths.py",
        "portable_mind/profiles.py",
        "portable_mind/records.py",
        "portable_mind/runtime.py",
        "portable_mind/state.py",
        "portable_mind/strict_json.py",
        "portable_mind/transfer.py",
        "profiles/kira.json",
        "profiles/synthetic_robert.json",
        "reviewed_seed_manifest.example.json",
        "tests/test_public_portable_mind.py",
        "tools/validate_public_release.py",
    }
)

MEDIA_OR_BINARY_SUFFIXES = {
    ".7z",
    ".avi",
    ".bin",
    ".ckpt",
    ".dll",
    ".docx",
    ".exe",
    ".fbx",
    ".flac",
    ".gif",
    ".glb",
    ".gltf",
    ".jpeg",
    ".jpg",
    ".m4a",
    ".mov",
    ".mp3",
    ".mp4",
    ".obj",
    ".ogg",
    ".pdf",
    ".pkl",
    ".png",
    ".pt",
    ".pyc",
    ".safetensors",
    ".so",
    ".stl",
    ".wav",
    ".webm",
    ".webp",
    ".zip",
}
FORBIDDEN_PATH_FRAGMENTS = {
    "voice" + ".py",
    "voice" + "_profiles",
    "memory" + "_exports",
    "people" + "/",
    "bootstrap" + ".py",
    "evaluator" + ".py",
    "custom" + "_voice_authorization",
    "voice" + "-package-hash",
    "handoff" + "_for_next_codex_session",
    "private" + "_delivery",
}
FORBIDDEN_LITERAL_WORDS = {
    "pe" + "ter",
    "mari" + "nette",
    "kath" + "ryn",
    "li" + "sa",
    "tom" + " holland",
    "lady" + "bug",
}
FORBIDDEN_IMPORT_ROOTS = {
    "pyaudio",
    "pyttsx3",
    "rclpy",
    "serial",
    "sounddevice",
    "torch",
}

SECRET_PATTERNS = (
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b"),
    re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    re.compile(r"(?i)\b(api[_-]?key|access[_-]?token|client[_-]?secret)\s*[=:]\s*['\"][^'\"]{8,}"),
)
ABSOLUTE_USER_PATHS = (
    re.compile(r"(?i)\b[A-Z]:\\Users\\"),
    re.compile(r"/(?:Users|home)/[^/\s]+/"),
)
EMAIL_ADDRESS = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
OPAQUE_SHA256 = re.compile(r"(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])", re.IGNORECASE)
LONG_BASE64 = re.compile(r"(?<![A-Za-z0-9+/])[A-Za-z0-9+/]{240,}={0,2}(?![A-Za-z0-9+/])")
CONTROL_CHAR = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def _relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def _release_files() -> dict[str, Path]:
    result: dict[str, Path] = {}
    for path in ROOT.rglob("*"):
        if path.is_symlink():
            result[_relative(path)] = path
        elif path.is_file():
            result[_relative(path)] = path
    return result


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def calculated_manifest(files: dict[str, Path]) -> str:
    lines = [
        f"{_sha256(files[name])}  {name}"
        for name in sorted(EXPECTED_FILES - {MANIFEST_NAME})
    ]
    return "\n".join(lines) + "\n"


def _parse_manifest(text: str) -> dict[str, str]:
    entries: dict[str, str] = {}
    pattern = re.compile(r"([0-9a-f]{64})  ([A-Za-z0-9_./ -]+)")
    for line_number, line in enumerate(text.splitlines(), start=1):
        match = pattern.fullmatch(line)
        if not match:
            raise ValueError(f"invalid manifest line {line_number}")
        digest, name = match.groups()
        if name in entries:
            raise ValueError(f"duplicate manifest entry: {name}")
        entries[name] = digest
    return entries


def _strict_json(text: str, name: str) -> object:
    def no_duplicates(pairs: list[tuple[str, object]]) -> dict[str, object]:
        result: dict[str, object] = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"{name}: duplicate JSON key {key}")
            result[key] = value
        return result

    def no_nonfinite(value: str) -> None:
        raise ValueError(f"{name}: non-finite number {value}")

    return json.loads(text, object_pairs_hook=no_duplicates, parse_constant=no_nonfinite)


def _validate_python(name: str, text: str, problems: list[str]) -> None:
    try:
        tree = ast.parse(text, filename=name)
    except SyntaxError as exc:
        problems.append(f"{name}: invalid Python syntax at line {exc.lineno}")
        return
    for node in ast.walk(tree):
        roots: list[str] = []
        if isinstance(node, ast.Import):
            roots.extend(item.name.split(".", 1)[0] for item in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            roots.append(node.module.split(".", 1)[0])
        for root in roots:
            if root in FORBIDDEN_IMPORT_ROOTS:
                problems.append(f"{name}: prohibited public-runtime import {root}")


def _validate_command_surface(name: str, text: str, problems: list[str]) -> None:
    if "PYTHONDONTWRITEBYTECODE" not in text:
        problems.append(f"{name}: bytecode suppression environment is missing")
    if "PYTHONWARNINGS" not in text:
        problems.append(f"{name}: warnings-as-errors environment is missing")
    interpreter = re.compile(r"(?<![A-Za-z0-9_])(?:py|python|python3)\s+", re.IGNORECASE)
    bytecode_flag = re.compile(r"(?<![A-Za-z0-9_])(?:py|python|python3)\s+-B(?:\s|$)", re.IGNORECASE)
    command_prefixes = (
        "py ",
        "python ",
        "python3 ",
        "exec ",
        "run: ",
        "PYTHONDONTWRITEBYTECODE=",
    )
    for line_number, line in enumerate(text.splitlines(), start=1):
        stripped = line.strip()
        if stripped.startswith(command_prefixes) and interpreter.search(stripped):
            if not bytecode_flag.search(stripped):
                problems.append(f"{name}:{line_number}: Python command is missing -B")


def validate(*, check_manifest: bool = True) -> tuple[list[str], dict[str, Path]]:
    problems: list[str] = []
    for path in ROOT.rglob("*"):
        if path.is_dir() and path.name == "__pycache__":
            problems.append(f"generated Python cache directory is forbidden: {_relative(path)}")
    files = _release_files()
    actual = set(files)
    missing = sorted(EXPECTED_FILES - actual)
    extras = sorted(actual - EXPECTED_FILES)
    for name in missing:
        problems.append(f"missing allowlisted file: {name}")
    for name in extras:
        problems.append(f"file is outside the release allowlist: {name}")

    for name, path in sorted(files.items()):
        lowered_name = name.casefold()
        if path.is_symlink():
            problems.append(f"symlink is forbidden: {name}")
            continue
        if path.suffix.casefold() in MEDIA_OR_BINARY_SUFFIXES:
            problems.append(f"binary/media suffix is forbidden: {name}")
        if any(fragment in lowered_name for fragment in FORBIDDEN_PATH_FRAGMENTS):
            problems.append(f"private package surface is forbidden: {name}")
        if path.stat().st_size > 500_000:
            problems.append(f"release text file exceeds 500 KB: {name}")
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            problems.append(f"release file is not UTF-8 text: {name}")
            continue
        if text.startswith("\ufeff"):
            problems.append(f"UTF-8 BOM is forbidden: {name}")
        if CONTROL_CHAR.search(text):
            problems.append(f"unsupported control character in: {name}")
        if any(pattern.search(text) for pattern in SECRET_PATTERNS):
            problems.append(f"likely credential material in: {name}")
        if any(pattern.search(text) for pattern in ABSOLUTE_USER_PATHS):
            problems.append(f"local absolute user path in: {name}")
        if EMAIL_ADDRESS.search(text):
            problems.append(f"email address is forbidden in the public runtime: {name}")
        if name != MANIFEST_NAME and OPAQUE_SHA256.search(text):
            problems.append(f"opaque 64-hex value outside the public manifest: {name}")
        if LONG_BASE64.search(text):
            problems.append(f"long encoded blob is forbidden: {name}")
        lowered_text = text.casefold()
        for literal in FORBIDDEN_LITERAL_WORDS:
            if re.search(rf"(?<![a-z]){re.escape(literal)}(?![a-z])", lowered_text):
                problems.append(f"unapproved named-person literal in: {name}")
        for fragment in FORBIDDEN_PATH_FRAGMENTS:
            if fragment in lowered_text:
                problems.append(f"private package literal in: {name}")
        if name.endswith(".json"):
            try:
                _strict_json(text, name)
            except (json.JSONDecodeError, ValueError) as exc:
                problems.append(str(exc))
        if name.endswith(".py"):
            _validate_python(name, text, problems)

    config_path = files.get("config.example.json")
    if config_path:
        try:
            config = _strict_json(config_path.read_text(encoding="utf-8"), "config.example.json")
            features = config["features"]  # type: ignore[index]
            if features != {"voice": False, "body_control": False, "intent_proposals": False}:
                problems.append("config.example.json: public features must all be false")
            if config["backend"] != {"kind": "stub"}:  # type: ignore[index]
                problems.append("config.example.json: offline stub must be the default")
            if config["storage"]["persist_transcript"] is not False:  # type: ignore[index]
                problems.append("config.example.json: transcript persistence must default false")
        except (KeyError, TypeError, json.JSONDecodeError, ValueError) as exc:
            problems.append(f"config.example.json: boundary validation failed ({type(exc).__name__})")

    backend_path = files.get("portable_mind/backends.py")
    if backend_path:
        backend_text = backend_path.read_text(encoding="utf-8")
        if "ProxyHandler({})" not in backend_text:
            problems.append("local model transport must disable environment proxies")
        if "_NoRedirectHandler()" not in backend_text:
            problems.append("local model transport must install the no-redirect handler")
        if "urllib.request.urlopen" in backend_text:
            problems.append("global urllib urlopen is forbidden for local model transport")

    for command_file in (
        "README.md",
        "RUN_THIS_FIRST.md",
        "launchers/Kira Text Only Chat.cmd",
        "launchers/Synthetic Robert Text Only Chat.cmd",
        "launchers/kira_text_only.sh",
        "launchers/synthetic_robert_text_only.sh",
    ):
        path = files.get(command_file)
        if path:
            _validate_command_surface(command_file, path.read_text(encoding="utf-8"), problems)
            if command_file != "README.md":
                for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
                    if "-m portable_mind" in line and "--data-dir" not in line:
                        problems.append(
                            f"{command_file}:{line_number}: runtime command lacks an external data directory"
                        )

    expected_manifest_names = EXPECTED_FILES - {MANIFEST_NAME}
    manifest_path = files.get(MANIFEST_NAME)
    if check_manifest and manifest_path:
        try:
            entries = _parse_manifest(manifest_path.read_text(encoding="utf-8"))
            if set(entries) != expected_manifest_names:
                problems.append("public manifest path set does not match the exact allowlist")
            for name in sorted(set(entries) & set(files)):
                if entries[name] != _sha256(files[name]):
                    problems.append(f"public manifest digest mismatch: {name}")
        except ValueError as exc:
            problems.append(str(exc))

    repo_root = ROOT.parents[1]
    attributes = repo_root / ".gitattributes"
    required_attributes = {
        "integrations/portable_mind_runtime/** text eol=lf",
        ".github/workflows/portable-mind-public.yml text eol=lf",
    }
    if not attributes.is_file():
        problems.append("repository .gitattributes is missing")
    else:
        attribute_lines = {
            line.strip()
            for line in attributes.read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.lstrip().startswith("#")
        }
        if not required_attributes.issubset(attribute_lines):
            problems.append("repository .gitattributes lacks scoped LF rules")
    workflow = repo_root / ".github" / "workflows" / "portable-mind-public.yml"
    if not workflow.is_file():
        problems.append("repository CI workflow is missing")
    else:
        workflow_text = workflow.read_text(encoding="utf-8")
        _validate_command_surface(".github/workflows/portable-mind-public.yml", workflow_text, problems)
        unit_position = workflow_text.find("python -B -m unittest")
        first_validation = workflow_text.find("python -B tools/validate_public_release.py")
        kira_smoke = workflow_text.find("python -B -m portable_mind --profile kira")
        robert_smoke = workflow_text.find("python -B -m portable_mind --profile synthetic_robert")
        clean_proof = workflow_text.find("Prove workflow order leaves a clean release")
        final_validation = workflow_text.find(
            "python -B tools/validate_public_release.py", clean_proof + 1
        )
        ordered = (
            unit_position,
            first_validation,
            kira_smoke,
            robert_smoke,
            clean_proof,
            final_validation,
        )
        if any(position < 0 for position in ordered) or list(ordered) != sorted(ordered):
            problems.append("public CI test/validate/smoke/cache/revalidate order is incomplete")
        if workflow_text.count("PORTABLE_MIND_HOME:") < 2:
            problems.append("public CI smokes must use runner-temp data roots")
        if "-name __pycache__" not in workflow_text or "-name '*.pyc'" not in workflow_text:
            problems.append("public CI final regression must prove zero Python cache artifacts")
    return problems, files


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate the exact sanitized public release.")
    parser.add_argument(
        "--print-manifest",
        action="store_true",
        help="print calculated manifest content without changing files",
    )
    args = parser.parse_args(argv)
    problems, files = validate(check_manifest=not args.print_manifest)
    if args.print_manifest:
        if problems:
            for problem in problems:
                print(f"ERROR: {problem}", file=sys.stderr)
            return 1
        print(calculated_manifest(files), end="")
        return 0
    if problems:
        for problem in problems:
            print(f"ERROR: {problem}")
        print(f"FAIL: {len(problems)} public-release issue(s)")
        return 1
    print(
        f"PASS: {len(EXPECTED_FILES)} allowlisted text files; "
        f"{len(EXPECTED_FILES) - 1} manifest digests verified"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
