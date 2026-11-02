# Code Quest: one-screen recovery repair

Base: `e78b3477a205b24278688df3984ffe3e30e7c3a7`. Game asset version: `20261102-stoneward3`.

The scene and workbench now share the desktop viewport. Two passage choices, a highlighted current step, the coding objective, editor, result, Run and Continue stay together. A correct draft entered before choosing a route is preserved; Run explains the prerequisite and focuses a visible passage. Continue still requires the current route's successful interpreted program.

Long game-master narration, lessons, staged hints, command choices, journey/inventory, full results and the earned finale use native reading dialogs. Escape/Close return keyboard focus. The no-typing dialog explicitly explains an unchosen route and has a Choose passage recovery control. Legacy offscreen helpers are outside the Tab sequence. The full website Iris guide remains linked from About.

Desktop gameplay was checked at **2048x805, 1366x768, 1165x800 and 1165x600**, across all 14 missions in junction, blocked and cleared states. Checks include document width/height, individual element bounds, click hit targets and zero document scroll, rather than merely hiding overflow or cropping screenshots. The saved correct-PIX/no-route case completes without reset, reload, navigation or losing the draft.

Mobile 320/390px and a 683x384 CSS viewport at DPR2 (200%-zoom-equivalent) use readable vertical flow. Reading dialogs and longer programs may scroll internally. A browser zoom shortcut, physical phone hardware and audible speaker output are not verified by these tests.

Evidence:

- `layout/edited-no-route-2048x805.png` and `layout/edited-no-route-1165x600.png`: the reported state, full viewport.
- `layout/first-success-1165x600.png`: opened passage and enabled Continue, full viewport.
- `layout/screen-result.json`: focused desktop, draft recovery, mobile and keyboard/dialog assertions.
- `motion/browser-result.json`: actual WebGL action samples, joint/position/device changes, decoded canvas-pixel comparisons, all 14 primary and 14 alternative code gates, retries/reloads/cancellation, speech strings, hostile worker programs and Canvas fallback.
- `motion/mobile.png`: adaptive mobile full page; no horizontal overflow.

Regression commands:

```text
node tests/test-code-quest-screen.cjs
node tests/test-code-quest-browser.cjs
node tests/test-code-quest-interpreter.cjs
node tests/test-code-quest-state.cjs
node tests/test-code-quest-voice.cjs
node tests/test-code-quest-contracts.cjs
node tests/test-arcade.cjs
node tests/test-arcade-voice-animation.cjs
node tests/test-sitewide-iris.cjs
node tests/test-iris-soft-voice.cjs
node tests/test-iris-oct22-knowledge.cjs
node tests/test-public-google-voice-contact-20261027.cjs
python scripts/check_rejected_public_media.py
```

The renderer, mission/route data, state schema, teaching interpreter, pronunciation module, Firefly HTML, shared voice utility and Firefly/shared regression file are unchanged from the base commit. Iris knowledge integrity was checked locally using its exact Git LF bytes, then the original Windows checkout bytes were restored; CI uses a normal Linux checkout.

The browser harness now follows inline guidance and native dialogs, checks the primary Continue button, and requires the scene and program to remain visible during actual actions. Clock control still advances the real renderer's requestAnimationFrame/performance timeline and freezes real intermediate poses for pixel/joint checks. Native browser chrome may receive Tab focus; background game controls remain forbidden while a modal is open. Narration tests observe speech API calls, not audibility.

Final local browser results on Edge 156.0.4314.58: **6,077 focused screen/recovery assertions** (56 desktop mission runs, 15 captures) and **1,029 gameplay/animation assertions** (14 main + 14 alternative routes, 12 hostile programs, 25 captures). Both source-freeze manifests match the tested product files. Independent full-viewport desktop visual review and a separate keyboard/mobile review passed.
