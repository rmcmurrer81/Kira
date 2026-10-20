#!/usr/bin/env python3
"""Publish the agreed high-definition Kira Labs concept art into GitHub Pages.

One-time run. Downloads generated/staged artwork, validates actual image bytes,
creates a new cinema-background portrait composite, then updates page references.
Never silently publish non-images or change research outcomes.
"""
from pathlib import Path
from io import BytesIO
from urllib.request import Request, urlopen
from PIL import Image, ImageOps, ImageFilter, ImageEnhance, ImageDraw
import os
import numpy as np
import cv2

ROOT = Path("docs")
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True, parents=True)

def get_art(env: str, min_width: int) -> Image.Image:
    url = os.environ.get(env, "").strip()
    if not url.startswith("https://"):
        raise RuntimeError(f"{env}: missing HTTPS art URL")
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 (Kira-Labs-Site-Image-Fix)", "Accept": "image/*"})
    with urlopen(request, timeout=130) as response:
        blob = response.read(20_000_001)
        final_host = response.url.split("/")[2]
        mime = response.headers.get("Content-Type", "")
    if len(blob) > 20_000_000:
        raise RuntimeError(f"{env}: asset over 20 MB")
    try:
        img = Image.open(BytesIO(blob))
        img.load()
        img = img.convert("RGB")
    except Exception as exc:
        raise RuntimeError(f"{env}: response was not an image ({len(blob)} bytes, content-type {mime}, host {final_host})") from exc
    if img.width < min_width or img.height < 500:
        raise RuntimeError(f"{env}: downloaded image only {img.size}")
    print(f"{env}: validated {img.width}x{img.height}, {len(blob)} bytes, from {final_host}")
    return img

def save_webp(img: Image.Image, fname: str):
    path = ASSETS / fname
    img.save(path, format="WEBP", quality=92, method=6)
    with Image.open(path) as check:
        check.verify()
    print(f"Saved {path}: {path.stat().st_size:,} bytes")

city = get_art("KIRA_CITY_IMAGE_URL", 1800)
robot = get_art("KIRA_ROBOT_IMAGE_URL", 1400)

# True new assets with enough source pixels to support desktop Retina layouts.
save_webp(city, "kira-future-city-hd-20261020.webp")
save_webp(robot, "kira-humanoid-robot-hd-20261020.webp")

# Create a new cinematic founder image from the previously user-supplied
# three-quarter profile frame (rather than claiming an unrelated AI face is Robert).
# Replace the warm studio background with the newly generated waterfront skyline.
source_path = ASSETS / "about-turned-video-portrait.webp"
source = Image.open(source_path).convert("RGB")
sw, sh = source.size
pixels = np.asarray(source)
base_x, base_y = 2346.0, 1080.0
outer_points = [
    (795, 0), (1690, 0), (1810, 235), (1790, 575),
    (1950, 880), (2346, 1080), (440, 1080), (650, 900),
    (790, 680), (770, 390)
]
inner_points = [
    (985, 35), (1590, 0), (1660, 250), (1650, 500),
    (1760, 800), (1990, 1070), (780, 1080), (880, 875),
    (980, 650), (940, 360)
]
def scaled(points):
    return np.asarray([[(round(x * sw / base_x), round(y * sh / base_y)) for x,y in points]], np.int32)

mask = np.zeros((sh, sw), np.uint8)
cv2.fillPoly(mask, scaled(outer_points), cv2.GC_PR_FGD)
cv2.fillPoly(mask, scaled(inner_points), cv2.GC_FGD)
# Work in a smaller copy for quick, stable CPU segmentation.
factor = min(1.0, 1250.0 / sw)
w2, h2 = int(sw * factor), int(sh * factor)
p2 = cv2.resize(pixels, (w2, h2), interpolation=cv2.INTER_AREA)
m2 = cv2.resize(mask, (w2, h2), interpolation=cv2.INTER_NEAREST)
try:
    cv2.grabCut(p2, m2, None, np.zeros((1,65),np.float64), np.zeros((1,65),np.float64), 4, cv2.GC_INIT_WITH_MASK)
    fg = np.where((m2==cv2.GC_FGD) | (m2==cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    n, labels, stats, centroids = cv2.connectedComponentsWithStats(fg, 8)
    if n > 1:
        keep = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        fg = np.where(labels == keep, 255, 0).astype(np.uint8)
    fg = cv2.resize(fg, (sw,sh), interpolation=cv2.INTER_LINEAR)
    if float(np.mean(fg > 128)) < .10:
        raise RuntimeError("Foreground segmentation unexpectedly small")
except Exception as ex:
    print("Foreground-edge fallback:", str(ex))
    fg = np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD),255,0).astype(np.uint8)
a = Image.fromarray(fg, "L").filter(ImageFilter.GaussianBlur(15))
# Keep the subject naturally large, sitting on the right as in approved mockups.
size=(1920,1080)
front=ImageOps.fit(source, size, method=Image.Resampling.LANCZOS, centering=(.56,.5))
alpha=ImageOps.fit(a, size, method=Image.Resampling.LANCZOS, centering=(.56,.5))
back=ImageOps.fit(city, size, method=Image.Resampling.LANCZOS, centering=(.49,.47))
back=ImageEnhance.Brightness(back).enhance(.66)
portrait=Image.composite(front, back, alpha)
portrait = portrait.filter(ImageFilter.UnsharpMask(radius=1.1, percent=106, threshold=3))
save_webp(portrait, "robert-cinematic-waterfront-20261020.webp")

def update(filename, old, new):
    path=ROOT / filename
    body=path.read_text(encoding="utf-8")
    if old not in body:
        raise RuntimeError(f"{filename}: expected text not found: {old[:100]}")
    count=body.count(old)
    path.write_text(body.replace(old,new),encoding="utf-8")
    print(f"Changed {filename}: {count} replacement(s)")

old_robot = "assets/kira-card-humanoid-robot.webp"
new_robot = "assets/kira-humanoid-robot-hd-20261020.webp"
for page in ["kira-world.html", "companion-robotics.html"]:
    update(page,old_robot,new_robot)

update("contact.html", 'assets/hero-contact-city-20261020.webp',
    'assets/kira-future-city-hd-20261020.webp')

update("fidelity-website-20261020.css",
    "assets/kira-future-city-clean-20261020.webp",
    "assets/kira-future-city-hd-20261020.webp")

update("about.html", "assets/robert-mcmurrer-portrait.webp",
    "assets/robert-cinematic-waterfront-20261020.webp")
update("about.html", "Previously approved · AI-assisted portrait",
    "Cinematic composite · AI-assisted imagery")
update("about.html",
    "Previously approved AI-assisted founder portrait of Robert McMurrer in a Kira Labs workspace, based on supplied reference photographs",
    "New cinematic composite of Robert’s approved AI-assisted film portrayal against a city skyline, illustrative and not an unedited photograph")
update("about.html",
    "AI-assisted founder portrait from Robert’s previously approved reference photographs. It is not an unedited personal photograph.",
    "Cinematic AI-assisted composite based on Robert’s supplied creative footage. Not an unedited personal photograph.")

# Cache-bust CSS across pages and keep the responsive image/text separation.
for path in ROOT.glob("*.html"):
    data = path.read_text(encoding="utf-8")
    fresh = data.replace("fidelity-website-20261020.css?v=20261020-6",
        "fidelity-website-20261020.css?v=20261020-7").replace(
        "hero-layout-fix-20261020.css?v=1",
        "hero-layout-fix-20261020.css?v=2")
    if fresh != data:
        path.write_text(fresh,encoding="utf-8")

print("Kira Labs media source update complete; the site remains fully static.")
