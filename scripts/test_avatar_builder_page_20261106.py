#!/usr/bin/env python3
"""Browser regressions for the real, fully sourced Kira Labs Avatar Builder page."""
from __future__ import annotations
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8765/kira-world-avatar-builder.html"
ASSETS = [
    "assets/evelyn-hart-holographic-medlab-concept-20261021.jpg",
    "assets/evelyn-avatar-cinematic-concept-20261024.jpg",
    "assets/kira-world-avatar-builder-visual-20261023.svg",
    "assets/animations/avatar-builder-concept.gif",
    "assets/avatar-builder-anatomy-research-map-20261106.svg",
    "assets/evelyn-sitting-poster-20261025.jpg",
]
ARCHIVE_IDS = [
    "avatar-builder-v12-body-v9-2026-11-05",
    "avatar-builder-v11-body-v7-2026-11-04",
    "avatar-builder-motion-library-2026-10-31",
    "avatar-builder-sitting-2026-10-25",
    "current-status", "evidence", "detailed-research-avatar-builder",
    "avatar-builder-first-body-reference-2026-10-21",
]
NEW_IDS = ["avatar-builder-overview", "ab-research-focus", "ab-anatomy-map",
           "ab-progress", "ab-motion-demo", "ab-journal-heading"]

def check_images(page):
    for url in ASSETS:
        response = page.request.get("http://127.0.0.1:8765/" + url)
        assert response.status == 200, f"Missing published image {url}: {response.status}"
    images = page.locator(".ab-visual img")
    assert images.count() >= 6, "Not enough different visuals on new page"
    for img in images.all():
        # Decorative CSS movement is intentional: test image decoding without Playwright's stability wait.
        img.evaluate("node => node.scrollIntoView({block: 'center', behavior: 'instant'})")
        img.evaluate("node => node.decode()")
        assert img.evaluate("node => node.naturalWidth > 100 && node.naturalHeight > 100"), (
            "Broken image " + (img.get_attribute("src") or "")
        )

def check_structure(page):
    page.goto(BASE, wait_until="domcontentloaded", timeout=30000)
    page.locator("#avatar-builder-overview").wait_for()
    assert page.locator(".ab-focus-card").count() == 3
    assert page.locator(".ab-result-card").count() == 3
    assert page.locator(".ab-journal-shortcuts a").count() == 4
    assert page.locator("main > section.kw-section").count() >= 20, "Historical research sections were lost"
    assert page.locator('a[href="#ab-anatomy-map"]').count() > 0
    assert page.locator('a[href="#avatar-builder-sitting-2026-10-25"]').count() > 0
    for node_id in NEW_IDS + ARCHIVE_IDS:
        assert page.locator('#' + node_id).count() == 1, f"Missing or duplicated source anchor {node_id}"
    player = page.locator("#avatar-builder-sitting-2026-10-25 video")
    assert player.count() == 1 and player.get_attribute("controls") is not None, "Existing sitting video changed"
    assert player.get_attribute("autoplay") is None, "Do not autoplay the silent sitting diagnostic"
    assert "public-censored.mp4" in player.locator("source").get_attribute("src")
    assert page.locator('.kw-navline a[aria-current="page"]').count() == 1
    assert page.locator("body > main#main").count() == 1, "Main must remain a single direct child of body"
    assert page.locator("script[src*='labs.js']").count() >= 1, "Iris site script missing"
    assert page.locator("#kw-heading").inner_text().startswith("Avatar Builder")

def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=["--no-sandbox"])
        errors = []
        for width, height, motion in [
            (1440, 900, "no-preference"), (820, 1080, "no-preference"),
            (390, 844, "reduce")
        ]:
            context = browser.new_context(viewport={"width": width, "height": height},
                                          reduced_motion=motion)
            page = context.new_page()
            page.on("pageerror", lambda error: errors.append(str(error)))
            check_structure(page)
            check_images(page)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), (
                f"Unexpected horizontal overflow at {width}px"
            )
            if motion == "reduce":
                assert page.locator(".ab-character-portrait").evaluate(
                    "el => getComputedStyle(el).animationName"
                ) == "none", "Reduced-motion setting was ignored"
                gif = page.locator('.ab-focus-card:nth-child(3) picture img')
                gif.scroll_into_view_if_needed()
                assert "kira-world-avatar-builder-visual" in gif.evaluate("img => img.currentSrc"), (
                    "Reduced-motion still image did not replace the animation"
                )
            context.close()

        # Link navigation must land on actual dated evidence, not a missing header.
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()
        page.goto(BASE)
        page.locator('.ab-journal-shortcuts a[href="#avatar-v68-recovery-2026-11-06"]').click()
        assert page.evaluate("location.hash") == "#avatar-v68-recovery-2026-11-06"
        assert page.locator("#avatar-v68-recovery-2026-11-06").is_visible()
        context.close()
        browser.close()
        assert not errors, "Browser JavaScript errors: " + " | ".join(errors)
        print("Avatar Builder page PASS: 3 research cards, animation and reduced-motion fallback,"
              " anatomy map, original censored video, 7 preserved research anchors, links,"
              " and desktop/tablet/mobile layouts.")

if __name__ == "__main__":
    main()
