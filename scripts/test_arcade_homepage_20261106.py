#!/usr/bin/env python3
"""Test the real Arcade homepage at desktop/mobile width using Chromium."""
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8765/arcade/"

def check_images(page):
    for game in ("code-quest", "circuitbound", "little-signal", "firefly-trail"):
        card = page.locator('a.ar-game-cover[data-arcade-visit="' + game + '"]')
        assert card.count() == 1, f"Missing real artwork card {game}"
        card.scroll_into_view_if_needed()
        image = card.locator("img")
        image.wait_for(state="visible")
        image.evaluate("img => img.decode()")
        dimensions = image.evaluate("img => [img.naturalWidth, img.naturalHeight]")
        assert dimensions[0] >= 300 and dimensions[1] >= 180, f"Missing screenshot for {game}: {dimensions}"


def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        errors = []
        desktop = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="no-preference")
        page = desktop.new_page()
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.goto(BASE, wait_until="domcontentloaded")
        page.locator("#ar-title").wait_for()
        assert page.locator(".ar-game-tile").count() == 4
        assert page.locator("#ar-passport").count() == 1
        # Arcade has the exact same primary navigation labels and order as the main site.
        expected = ["Home", "Projects", "Research", "Lab timeline", "About",
                    "Support", "Partners", "Arcade", "Shop", "Contact"]
        titles = page.locator("#primary-nav a").all_inner_texts()
        assert titles == expected, f"Arcade navigation differs from Kira Labs: {titles}"
        assert page.locator('#primary-nav a[aria-current="page"]').inner_text() == "Arcade"
        assert page.locator("#primary-nav a").count() == len(set(titles))
        check_images(page)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), "Desktop horizontal overflow"
        assert page.locator("#ar-sound-toggle").get_attribute("aria-pressed") == "false", "Sound must be off until requested"
        assert page.locator("#ar-visit-count").inner_text() == "0 / 4"

        # Standard links stay navigable; we prevent only this test's one click from navigating.
        for url in ("code-quest/", "circuitbound/", "little-signal/", "code-quest/your-first-game.html", "code-quest/learn.html"):
            response = page.request.get(BASE + url)
            assert response.status == 200, (url, response.status)
        page.evaluate("""() => {
          document.addEventListener('click', e => {
            if (e.target.closest('a[data-arcade-visit], a[data-arcade-learn]')) e.preventDefault();
          }, true);
        }""")
        page.locator('.ar-game-cover[data-arcade-visit="code-quest"]').click()
        assert page.locator("#ar-visit-count").inner_text() == "1 / 4"
        assert page.locator('[data-badge="starter"]').get_attribute("data-unlocked") == "true"
        page.locator('.ar-learning-card[data-arcade-learn="code-quest"]').click()
        assert page.locator('[data-badge="creator"]').get_attribute("data-unlocked") == "true"
        page.locator("#ar-sound-toggle").click()
        assert page.locator("#ar-sound-toggle").get_attribute("aria-pressed") == "true"
        assert "On" in page.locator("#ar-sound-toggle").inner_text()

        page.reload(wait_until="domcontentloaded")
        assert page.locator("#ar-visit-count").inner_text() == "1 / 4", "Passport did not persist"
        assert page.locator('[data-badge="creator"]').get_attribute("data-unlocked") == "true"
        assert page.locator("#ar-sound-toggle").get_attribute("aria-pressed") == "false", "Sound should not autoplay after reload"

        page.once("dialog", lambda dialog: dialog.accept())
        page.locator("#ar-passport-reset").click()
        assert page.locator("#ar-visit-count").inner_text() == "0 / 4"
        assert page.locator('[data-badge="starter"]').get_attribute("data-unlocked") == "false"

        # The cards remain single-column and easy to tap on a phone.
        mobile = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
        m = mobile.new_page()
        m.on("pageerror", lambda err: errors.append(str(err)))
        m.goto(BASE, wait_until="domcontentloaded")
        m.locator("#ar-title").wait_for()
        check_images(m)
        assert m.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), "Mobile horizontal overflow"
        assert len(m.locator(".ar-game-tile").all()) == 4
        assert m.locator("#ar-passport-reset").is_visible()
        assert m.locator("#ar-sound-toggle").get_attribute("aria-pressed") == "false"
        assert m.locator(".ar-hero-screen").evaluate("el => getComputedStyle(el).animationName") == "none", "Reduced motion unsupported"
        assert not errors, "Browser error: " + " | ".join(errors)
        browser.close()
        print("Arcade homepage PASS: all 4 real game previews, mobile layout, optional audio, local passport, tutorial/game links, and reduced motion")

if __name__ == "__main__":
    test()
