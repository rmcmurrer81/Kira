#!/usr/bin/env python3
"""Block previously rejected Synthetic Robert imagery from the live Kira Labs site."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
BANNED = "robert-video-photoalbum-cinematic-20261020.webp"
OTHER_STYLIZED = "hero-robert-cinematic-film-still-20261020.webp"
APPROVED_ARTWORK = "robert-real-pub-outside-still-20261020.webp"

def main() -> int:
    problems = []
    if (DOCS / "assets" / BANNED).exists():
        problems.append(f"Banned generated portrait is present in public assets: {BANNED}")
    if not (DOCS / "assets" / APPROVED_ARTWORK).exists():
        problems.append(f"Expected specifically approved fabricated outdoor-pub artwork is missing: {APPROVED_ARTWORK}")
    for suffix in ("*.html", "*.css", "*.js"):
        for page in DOCS.glob(suffix):
            body = page.read_text(encoding="utf-8", errors="replace")
            if BANNED in body:
                problems.append(f"{page.relative_to(ROOT)} references rejected portrait")
            if page.name in {"kira-world.html", "kira-world-synthetic-robert.html"}:
                if OTHER_STYLIZED in body:
                    problems.append(f"{page.relative_to(ROOT)} substitutes an unapproved stylized Robert picture")
                if APPROVED_ARTWORK not in body:
                    problems.append(f"{page.relative_to(ROOT)} must link the exact approved stylized pub-scene artwork")
                if "approved fabricated" not in body.lower() and "fictionalized portrait" not in body.lower():
                    problems.append(f"{page.relative_to(ROOT)} must disclose the approved artwork is fabricated")
                inaccurate = ("not a generated likeness", "rather than a computer-generated portrait",
                              "real outdoor-pub video still", "actual outdoor-pub footage still",
                              "still frame from the existing real outdoor-pub footage")
                for phrase in inaccurate:
                    if phrase in body.lower():
                        problems.append(f"{page.relative_to(ROOT)} inaccurately describes fabricated artwork as real footage")
    if problems:
        print("REJECTED ROBERT IMAGERY: BLOCKED", file=sys.stderr)
        for p in problems:
            print(f" - {p}", file=sys.stderr)
        return 1
    print("Approved Robert imagery check passed: no rejected portrait on public site.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
