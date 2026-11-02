# Current-draft instruction correction

Base: `79f5ea710e210cf73196b1ac015768d9df07ca58`. Asset version: `20261102-stoneward4`.

Changing the editor switches the first three guided lessons to neutral, untested-draft instructions: choose a passage, then Run to check it. Guidance does not scan for PIX, evaluate code, create a worker, or award progress. The unchanged starter retains the original teaching and actual word highlighting, including after an unsuccessful first Run.

Only a real completed Run records current-draft verification, scoped to the exact code, mission and selected route. Editing clears the current success wording. Earned gates, rewards and Continue availability remain intact; reload describes an earlier cleared passage without claiming the current draft passed. Reset and restart clear transient verification.

Modified-draft helpers focus the draft or show a labelled original example. They never silently replace a custom draft, reset to starter, or select a misleading word in a comment. Copying an example requires its explicit replacement button. Hints, story and Replay use the current next action; the pronunciation and Iris voice settings are unchanged. A small remember(text) voice API refreshes Replay without autoplay or restarting speech during typing.

Final local Edge 156.0.4314.58 results:

- **508 guidance assertions**: 19 changed drafts across the first three guided missions; comments-only PIX, identifiers, other strings, wrong/incomplete/invalid programs, host syntax, infinite-loop text, delayed real-worker replies, helper preservation, actual verification, earned retry/reload, and stale-instruction movement errors.
- **1,029 adventure/animation assertions**: all 14 main and 14 alternative routes, real articulated action frames and pixels, retry/reset/reload/cancellation, 12 hostile worker programs, WebGL and Canvas fallback.
- **6,077 layout/recovery assertions**: all 14 missions at 2048x805, 1366x768, 1165x800 and 1165x600 with no desktop document scrolling; mobile320/390 and keyboard/dialog/zoom-equivalent checks.
- All three result manifests match the frozen product bytes.

See `guidance-result.json`, `motion/browser-result.json` and `layout/screen-result.json`. Representative full-viewport images: `saved-pix-no-route.png`, `saved-pix-route.png`, `verified-pix.png`, and `edited-after-success-reload.png`. Mobile full-page evidence is `motion/mobile.png`.

Interpreter, state schema, all mission/route data, renderer, game styles, Firefly and the shared arcade voice module are unchanged. Contracts/interpreter/state/voice, Arcade/Firefly, sitewide Iris, soft voice, contact-number and approved-public-image checks pass. CI also reruns the new guidance suite.

Known verification limits: mobile and enlarged CSS viewports can scroll vertically; physical phones, a browser zoom shortcut and audible speech are not verified. Speech assertions observe API calls and text, not speaker output.
