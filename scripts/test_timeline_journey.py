#!/usr/bin/env python3
"""Browser regression for the real Kira Labs picture timeline and its visitor-controlled autoplay."""
from __future__ import annotations

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8765/progress.html"


def position(page):
    return float(page.locator("#timeline-scroll").evaluate("(node) => node.scrollLeft"))


def ready(page):
    page.goto(BASE, wait_until="domcontentloaded")
    page.locator('#timeline-explorer[data-ready="true"]').wait_for(timeout=25000)
    assert page.locator("#milestones .milestone-point").count() >= 70
    assert page.locator("#milestone-detail").is_visible()
    assert page.locator("#journey-current-title").inner_text().strip()


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        errors = []
        desktop = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="no-preference")
        page = desktop.new_page()
        page.on("pageerror", lambda e: errors.append(str(e)))
        ready(page)
        assert page.locator("#journey-autoplay").get_attribute("aria-pressed") == "true", "Autoplay did not start"
        assert page.locator("#selected-position").inner_text().startswith("1 /"), "Journey must start at the earliest entry"
        page.wait_for_function("document.querySelector('#timeline-scroll').scrollLeft > 58", timeout=8000)
        assert position(page) > 58, "Timeline is not moving gradually"

        # Clicking the actual Pause control stops scrolling without changing milestone data.
        page.locator("#journey-autoplay").click()
        assert page.locator("#journey-autoplay").get_attribute("aria-pressed") == "false"
        paused = position(page)
        page.wait_for_timeout(1100)
        assert abs(position(page) - paused) < 2, "Timeline continued after Pause"

        # Play resumes at the paused scroll position.
        page.locator("#journey-autoplay").click()
        assert page.locator("#journey-autoplay").get_attribute("aria-pressed") == "true"
        page.wait_for_function("(previous) => document.querySelector('#timeline-scroll').scrollLeft > previous + 45", arg=paused, timeout=8000)

        # Clicking a project filter cancels motion and keeps that filter usable.
        page.locator('button[data-project="NewBrain"]').click()
        assert page.locator("#journey-autoplay").get_attribute("aria-pressed") == "false"
        assert page.locator('button[data-project="NewBrain"]').get_attribute("aria-pressed") == "true"
        page.wait_for_timeout(1000)  # Let the ordinary selection-centering animation finish.
        filtered = position(page)
        page.wait_for_timeout(1000)
        assert abs(position(page) - filtered) < 2, "Timeline did not stop after a visitor selection"
        assert page.locator("#milestones .milestone-point").count() >= 2

        # Start over moves to the first filtered milestone and stays paused.
        page.locator("#journey-restart").click()
        assert page.locator("#journey-autoplay").get_attribute("aria-pressed") == "false"
        assert position(page) <= 1.5
        assert page.locator("#selected-position").inner_text().startswith("1 /")
        assert page.locator("#timeline-story").count() == 1, "Research history must stay intact"

        # Keyboard-accessible control and mobile horizontal sizing.
        mobile = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
        m = mobile.new_page()
        m.on("pageerror", lambda e: errors.append(str(e)))
        ready(m)
        assert m.locator("#journey-autoplay").is_disabled(), "Reduced-motion preference must prevent autoplay"
        mobile_initial = position(m)
        m.wait_for_timeout(1100)
        assert abs(position(m) - mobile_initial) < 2
        assert m.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 2"), "Unexpected mobile page overflow"

        # Visiting a specific milestone must not reset its selection or start autoplay.
        deeplink = browser.new_context(viewport={"width": 1280, "height": 860}, reduced_motion="no-preference")
        deep = deeplink.new_page()
        deep.on("pageerror", lambda e: errors.append(str(e)))
        deep.goto(BASE + "?project=NewBrain#newbrain-v3-closed-negative-2026-11-05", wait_until="domcontentloaded")
        deep.locator('#timeline-explorer[data-ready="true"]').wait_for(timeout=25000)
        assert deep.locator("#journey-autoplay").get_attribute("aria-pressed") == "false"
        assert "V3" in deep.locator("#detail-title").inner_text()
        assert deep.locator("#detail-image").count() == 1

        assert not errors, "Browser errors: " + " | ".join(errors)
        browser.close()
    print("Kira Labs timeline: slow continuous pan, pause/resume, filters, restart, deep links and reduced motion PASS")


if __name__ == "__main__":
    run()
