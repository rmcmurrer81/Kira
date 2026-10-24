#!/usr/bin/env python3
"""Block previously rejected Synthetic Robert imagery from the live Kira Labs site."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
BANNED = "robert-video-photoalbum-cinematic-20261020.webp"
OTHER_STYLIZED = "hero-robert-cinematic-film-still-20261020.webp"
APPROVED_STILL = "robert-real-pub-outside-still-20261020.webp"

def main() -> int:
    problems = []
    if (DOCS / "assets" / BANNED).exists():
        problems.append(f"Banned generated portrait is present in public assets: {BANNED}")
    if not (DOCS / "assets" / APPROVED_STILL).exists():
        problems.append(f"Expected actual outdoor-pub still is missing: {APPROVED_STILL}")
    for suffix in ("*.html", "*.css", "*.js"):
        for page in DOCS.glob(suffix):
            body = page.read_text(encoding="utf-8", errors="replace")
            if BANNED in body:
                problems.append(f"{page.relative_to(ROOT)} references rejected portrait")
            if page.name in {"kira-world.html", "kira-world-synthetic-robert.html"}:
                if OTHER_STYLIZED in body:
                    problems.append(f"{page.relative_to(ROOT)} substitutes an unapproved stylized Robert picture")
                if APPROVED_STILL not in body:
                    problems.append(f"{page.relative_to(ROOT)} must link the real outdoor-pub still")
    if problems:
        print("REJECTED ROBERT IMAGERY: BLOCKED", file=sys.stderr)
        for p in problems:
            print(f" - {p}", file=sys.stderr)
        return 1
    print("Approved Robert imagery check passed: no rejected portrait on public site.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
