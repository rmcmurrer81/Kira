#!/usr/bin/env python3
"""Capture a truthful Byte & Bolt arcade thumbnail from the actual shipped town renderer.
Use the game's built-in 2D compatibility graphics for deterministic headless CI.
Does not modify saves, award progress, or generate fictional game art.
"""
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps, ImageStat
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8765/arcade/byte-bolt/"
OUT = Path("docs/arcade/previews/byte-bolt-real-gameplay-20261107.webp")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    page = browser.new_page(viewport={"width": 1280, "height": 720}, device_scale_factor=1)
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    # In the published game, failure to create WebGL naturally activates this
    # same 2D compatibility renderer. It remains real shipped gameplay.
    page.add_init_script("""() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        if(type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl')
          return null;
        return original.call(this, type, ...args);
      };
    }""")
    response = page.goto(BASE, wait_until="domcontentloaded", timeout=30000)
    assert response and response.status == 200
    page.locator("#world").wait_for(state="visible", timeout=12000)
    page.wait_for_timeout(2100)
    assert page.locator("#objective").inner_text().strip(), "Missing live mission objective"
    assert page.locator("#jobs").is_visible(), "Game job board unavailable"
    assert page.locator("#fallback").is_hidden(), "The compatibility town should load"
    assert not errors, "Game JavaScript errors: " + " | ".join(errors)
    raw = page.screenshot(type="png", animations="disabled")
    im = Image.open(BytesIO(raw)).convert("RGB")
    assert im.size == (1280, 720), im.size
    # Reject a blank or black screenshot rather than publishing fake thumbnail.
    variation = sum(ImageStat.Stat(im).stddev) / 3
    assert variation > 10, "Town screenshot appears blank: " + str(variation)
    preview = ImageOps.fit(im, (960, 540), method=Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    preview.save(OUT, format="WEBP", quality=88, method=6)
    assert OUT.stat().st_size > 7000, "Preview looks too small/blank"
    print(f"Verified live Byte & Bolt scene: {im.size}, average RGB stddev={variation:.1f}; saved {OUT} ({OUT.stat().st_size} bytes)")
    browser.close()
