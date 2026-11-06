#!/usr/bin/env python3
"""Capture *actual* Kira Labs Arcade browser game stages for public game cards.

All captures come from this checked-out GitHub Pages site, never third-party images.
No persistent state is modified and no game completion is claimed.
"""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
import time

from PIL import Image, ImageEnhance, ImageOps
from playwright.sync_api import sync_playwright

OUT = Path("docs/arcade/previews")
ORIGIN = "http://127.0.0.1:8765"
GAMES = [
    ("code-quest", "/arcade/code-quest/", ".cq-stage"),
    ("circuitbound", "/arcade/circuitbound/", ".stage"),
    ("little-signal", "/arcade/little-signal/", ".stage"),
    ("firefly-trail", "/arcade/code-quest/your-first-game.html", ".world"),
]


def capture(browser, name, path, selector):
    page = browser.new_page(viewport={"width": 1366, "height": 920}, device_scale_factor=1, reduced_motion="no-preference")
    problems = []
    page.on("pageerror", lambda err: problems.append(str(err)))
    page.goto(ORIGIN + path, wait_until="domcontentloaded", timeout=30000)
    target = page.locator(selector).first
    target.wait_for(state="visible", timeout=20000)
    page.wait_for_timeout(1600)
    shot = target.screenshot(type="png", animations="disabled", timeout=30000)
    source = Image.open(BytesIO(shot)).convert("RGB")
    if source.width < 150 or source.height < 100:
        raise RuntimeError(f"Stage too small: {name} {source.size}")
    # Don't stretch gameplay. Fit inside the standard card ratio on dark matte.
    canvas = Image.new("RGB", (960, 540), (8, 19, 38))
    render = ImageOps.contain(source, (960, 540), Image.Resampling.LANCZOS)
    canvas.paste(render, ((960 - render.width) // 2, (540 - render.height) // 2))
    canvas = ImageEnhance.Contrast(canvas).enhance(1.07)
    filename = OUT / f"{name}-real-gameplay-20261106.webp"
    canvas.save(filename, "WEBP", quality=86, method=6)
    if filename.stat().st_size < 2500:
        raise RuntimeError(f"Screenshot suspiciously tiny: {filename}")
    print(f"Captured {name}: {source.width}x{source.height} -> {filename} {filename.stat().st_size:,} bytes; errors: {problems[:2]}")
    page.close()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        try:
            for game in GAMES:
                capture(browser, *game)
        finally:
            browser.close()
    assert len(list(OUT.glob("*-real-gameplay-20261106.webp"))) == 4
    print("Captured all four genuine game interfaces.")


if __name__ == "__main__":
    main()
