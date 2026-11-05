#!/usr/bin/env python3
"""Install the three approved animated Kira Labs concept illustrations on topic pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
ASSETS = DOCS / "assets" / "animations"

SETTINGS = (
    (
        "newbrain.html",
        '<section class="section rule" id="newbrain-v9-pathway-study-2026-11-04"',
        "newbrain-concept.gif",
        "NewBrain",
        "Animated concept illustration of a luminous neural brain with blue and violet connections, not a working NewBrain system.",
    ),
    (
        "kira-world-avatar-builder.html",
        '<section class="kw-section" id="avatar-builder-v8-v9-body-v5-2026-11-04"',
        "avatar-builder-concept.gif",
        "Avatar Builder",
        "Animated concept illustration of a digital humanoid bust assembling from glowing wireframe points, not an accepted body render.",
    ),
    (
        "kira-world.html",
        '<section class="kw-hub kw-hub-compact" id="kira-world-topics"',
        "kira-world-concept.gif",
        "Kira World",
        "Animated concept illustration of two figures approaching a luminous virtual-world portal, not a running-world screenshot.",
    ),
)

STYLE = """/* Kira Labs concept animations — illustrations, not research evidence */
.ks-animated-concept {
  display: flex;
  justify-content: center;
  padding: clamp(16px, 3vw, 36px) 16px;
  background: linear-gradient(180deg, #080b19 0%, #101530 60%, #0c1122 100%);
}
.ks-animated-concept__figure {
  width: min(100%, 780px);
  margin: 0;
}
.ks-animated-concept__figure img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 16px;
  border: 1px solid rgba(119, 143, 255, .30);
  box-shadow: 0 14px 36px rgba(4, 6, 25, .40);
}
.ks-animated-concept__figure figcaption {
  margin: 10px 6px 0;
  text-align: center;
  font-size: .84rem;
  line-height: 1.5;
  color: #b7c6dc;
}
@media (prefers-reduced-motion: reduce) {
  .ks-animated-concept { display: none; }
}
"""

def main():
    for filename, marker, asset, label, alt in SETTINGS:
        path = ASSETS / asset
        if not path.is_file() or path.stat().st_size < 10_000:
            raise RuntimeError(f"Missing or truncated animation: {path}")
        if path.read_bytes()[:6] not in (b"GIF87a", b"GIF89a"):
            raise RuntimeError(f"Expected genuine GIF file: {path}")
        doc = DOCS / filename
        html = doc.read_text(encoding="utf-8")
        if marker not in html:
            raise RuntimeError(f"Unable to locate insertion point in {filename}")
        link = '<link rel="stylesheet" href="concept-animations.css?v=20261104"/>'
        if link not in html:
            if "</head>" not in html:
                raise RuntimeError(f"Missing HTML head: {filename}")
            html = html.replace("</head>", link + "</head>", 1)
        section = f'''<section class="ks-animated-concept" aria-label="{label} illustrative animation"><figure class="ks-animated-concept__figure"><img src="assets/animations/{asset}" alt="{alt}" width="718" height="357" decoding="async" loading="lazy"/><figcaption>Animated concept illustration · Not a live demonstration or measured research result.</figcaption></figure></section>'''
        if f'src="assets/animations/{asset}"' not in html:
            html = html.replace(marker, section + marker, 1)
        if html.count(f'src="assets/animations/{asset}"') != 1:
            raise RuntimeError(f"Unexpected duplicate or missing concept art in {filename}")
        doc.write_text(html, encoding="utf-8")
        print(f"Ready: {filename} -> {asset}")

    (DOCS / "concept-animations.css").write_text(STYLE, encoding="utf-8")
    print("Three illustrations placed; original hero art and research entries preserved.")

if __name__ == "__main__":
    main()
