#!/usr/bin/env python3
"""Replace specific Kira Labs project-card stills with the owner's seven animated GIFs.

Only navigational cards are changed: no full-width standalone sections, research images,
video evidence, approved identity art, or publication facts are modified.
"""
from pathlib import Path
import re
import html

ROOT = Path(__file__).resolve().parents[1] / "docs"
ASSETS = ROOT / "assets" / "animations"
CSS_LINK = '<link rel="stylesheet" href="concept-animations.css?v=20261105-cards1"/>'

HOMEPAGE = {
    "newbrain.html": ("home-neural-highres-20261020.webp", "newbrain-card.gif"),
    "patient-horizon.html": ("patient-horizon-clinical-avatar-concept-2026-10-18.jpg", "patient-horizon-card.gif"),
    "kira-world.html": ("kira-card-home-apartments.webp", "kira-world-home-card.gif"),
    "evelyn-hart.html": ("evelyn-hart-holographic-medlab-concept-20261021.jpg", "evelyn-hart-card.gif"),
    "companion-robotics.html": ("companion-robot-highres-20261020.webp", "companion-robotics-card.gif"),
    "tools-apps.html": ("kiralabs-tools-apps-hd-concept-20261024.jpg", "tools-apps-card.gif"),
}

PROJECTS = {
    "kira-world": ("kira-world-companionship-concept-2026-10-18.jpg", "kira-world-project-card.gif"),
    "patient-horizon": ("patient-horizon-clinical-avatar-concept-2026-10-18.jpg", "patient-horizon-project-card.gif"),
    "evelyn-hart": ("evelyn-hart-holographic-medlab-concept-20261021.jpg", "evelyn-hart-project-card.gif"),
}

def check_assets():
    files=set()
    for _, gif in list(HOMEPAGE.values()) + list(PROJECTS.values()):
        files.add(gif)
    files.add("kira-world-home-card.gif")
    for gif in files:
        path = ASSETS / gif
        if not path.is_file() or path.stat().st_size < 50000:
            raise RuntimeError(f"Missing/truncated GIF: {path}")
        if path.read_bytes()[:6] not in (b"GIF87a", b"GIF89a"):
            raise RuntimeError(f"Not a real GIF: {path}")
    print(f"Validated {len(files)} animated assets")

def picture(original, gif, alt, portrait=False):
    source = html.escape(original, quote=True)
    alt = html.escape(alt, quote=True)
    dimensions = 'width="478" height="536"' if portrait else 'width="640" height="360"'
    return (
        f'<picture><source media="(prefers-reduced-motion: reduce)" srcset="{source}"/>'
        f'<img src="assets/animations/{gif}" alt="{alt}" loading="lazy" decoding="async" '
        f'{dimensions} onerror="this.onerror=null;this.src=&#39;{source}&#39;;"/></picture>'
    )

def apply_home():
    path = ROOT / "index.html"
    doc = path.read_text(encoding="utf-8")
    for href, (expected_still, gif) in HOMEPAGE.items():
        pattern = re.compile(r'(<a class="hl-program" href="' + re.escape(href) + r'">)(<img\b[^>]*>)')
        matches = list(pattern.finditer(doc))
        if len(matches) != 1:
            raise RuntimeError(f"Expected one homepage card for {href}, found {len(matches)}")
        img = matches[0].group(2)
        source = re.search(r'\bsrc="([^"]+)"', img)
        alt = re.search(r'\balt="([^"]*)"', img)
        if not source or not alt or expected_still not in source.group(1):
            raise RuntimeError(f"Unexpected homepage card for {href}")
        doc = pattern.sub(lambda m: m.group(1) + picture(source.group(1), gif, alt.group(1)), doc, count=1)
    doc = doc.replace('</head>',CSS_LINK+'</head>',1) if CSS_LINK not in doc else doc
    path.write_text(doc,encoding="utf-8")
    print("Homepage: 6 project-card animations installed; original hero stays unchanged")

def apply_projects():
    path = ROOT / "projects.html"
    doc = path.read_text(encoding="utf-8")
    for project_id, (expected_still, gif) in PROJECTS.items():
        pattern = re.compile(
            r'(<article class="project" id="' + re.escape(project_id)
            + r'">.*?<div class="projectpicture"><a\b[^>]*>)(<img\b[^>]*>)',
            flags=re.DOTALL,
        )
        matches=list(pattern.finditer(doc))
        if len(matches) != 1:
            raise RuntimeError(f"Expected one Projects card for {project_id}, got {len(matches)}")
        img=matches[0].group(2)
        source=re.search(r'\bsrc="([^"]+)"',img)
        alt=re.search(r'\balt="([^"]*)"',img)
        if not source or not alt or expected_still not in source.group(1):
            raise RuntimeError(f"Unexpected Projects image for {project_id}")
        replacement=picture(source.group(1),gif,alt.group(1),portrait=True)
        doc=pattern.sub(lambda m:m.group(1)+replacement,doc,count=1)
    doc=re.sub(r'<link rel="stylesheet" href="concept-animations\.css\?v=[^"]*"/>', '',doc)
    if '</head>' not in doc:raise RuntimeError("Missing projects HTML head")
    doc=doc.replace('</head>',CSS_LINK+'</head>',1)
    path.write_text(doc,encoding="utf-8")
    print("Projects: Kira World, Patient Horizon and Evelyn project images animated")

def apply_world_hub():
    path=ROOT/"kira-world.html"
    doc=path.read_text(encoding="utf-8")
    pattern=re.compile(r'(<a class="kw-card" href="kira-world-home\.html">)(<img\b[^>]*>)')
    hits=list(pattern.finditer(doc))
    if len(hits)!=1 or 'kira-card-home-apartments.webp' not in hits[0].group(2):
        raise RuntimeError("Unable to safely locate Kira World home-topic card")
    img=hits[0].group(2)
    source=re.search(r'\bsrc="([^"]+)"',img)
    alt=re.search(r'\balt="([^"]*)"',img)
    doc=pattern.sub(lambda m:m.group(1)+picture(source.group(1),"kira-world-home-card.gif",alt.group(1)),doc,count=1)
    doc=re.sub(r'<link rel="stylesheet" href="concept-animations\.css\?v=[^"]*"/>','',doc)
    doc=doc.replace('</head>',CSS_LINK+'</head>',1)
    path.write_text(doc,encoding="utf-8")
    print("Kira World: matching existing Home World topic card animated")

STYLES = """
/* Approved GIFs occupy existing project-card image slots; no extra page sections. */
.hl-home .hl-program > picture {
  display:block; order:0; flex:none; width:100%; line-height:0;
}
.hl-home .hl-program > picture img {
  display:block; width:100%; height:auto; aspect-ratio:16/9; object-fit:cover;
}
.catalogue .projectpicture a > picture {display:block;width:100%;line-height:0}
.catalogue .projectpicture a > picture img {
  display:block;width:100%;height:240px;object-fit:cover;object-position:center 35%;
}
.catalogue #evelyn-hart .projectpicture a > picture img {
  width:100%;height:330px;object-fit:contain;background:#0e1b2d;
}
.kw-hub .kw-card > picture {display:block;width:100%;line-height:0}
.kw-hub .kw-card > picture img {display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover}
/* The static originals are automatically selected via <picture> for reduced motion. */
"""

def apply_styles():
    path=ROOT/"concept-animations.css"
    doc=path.read_text(encoding="utf-8")
    tag="/* Approved GIFs occupy existing project-card image slots"
    if tag not in doc:
        path.write_text(doc+"\n"+STYLES,encoding="utf-8")

if __name__=="__main__":
    check_assets()
    apply_home()
    apply_projects()
    apply_world_hub()
    apply_styles()
    print("Success: all seven concepts installed as card images; no hero overwrite")
