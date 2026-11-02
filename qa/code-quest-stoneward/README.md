# Code Quest: The Stoneward Oath — visual review

This revision replaces the prior flat scene with a locally rendered, stylized 3D dungeon. It is not photorealistic. The scene uses actual geometry, materials, lighting and shadows; PIX is a persistent articulated actor. The local Three.js 0.180.0 dependency is bundled with its MIT license.

## Inspect the actual actions

- [Dungeon and quest UI](desktop-junction.png)
- Creature ambush: [begin](ambush-begin.png), [airborne middle](ambush-mid.png), [blocked encounter](ambush-end.png)
- Code-driven walking: [begin](movement-begin.png), [moving middle](movement-mid.png), [end](movement-end.png)
- [Operating the lever](lever-mid.png), [turning](turn-mid.png), [collecting a part](collect-mid.png)
- Creature geometry: [wraith](creature-wraith.png), [hound](creature-hound.png), [crawler](creature-crawler.png), [lurker](creature-lurker.png), [sentinel](creature-sentinel.png)
- [Mobile 3D view](mobile.png), [Canvas fallback](mobile-fallback.png), [restored wards](ward-complete.png)

These are browser screenshots of the implemented renderer and game, not proposed artwork. Action QA samples position, yaw, joints, device and inventory state at beginning/middle/end, preserves actor identity, and compares decoded image pixels. The final frozen-source Edge run passed 1,002 assertions; see browser-result.json. Walking changed decoded image pixels by 21.80% from begin to middle and 22.36% from middle to end, with a stable actor identity and changing articulated joints.

## Adventure and learning

Fourteen programming encounters offer twenty-eight routes. Wrong turns reveal physical creature ambushes and blocked passages; they do not remove supplies or permanently penalize a beginner. Return to a junction, change route or repair the code. A route-specific gate can clear only after the bounded interpreter result satisfies the mission objective. Route, encounter, gate, reward, inventory and cumulative town defense are saved. Each earned part, ally or opened passage advances the rescue from the stormwraith. Iris narrates as the game master and reacts to choices, failures and rewards.

The highlighted first edit, worked examples, staged hints and explained no-typing choices remain. PIX stays PIX in all visible text, code, solutions and saved drafts; only speech copies normalize standalone PIX to the ordinary word picks. Fixed Iris voice priorities/rate/pitch are preserved. Native Edge utterances and start/end events were captured in native-speech-probe-result.json; this does not prove audible speaker quality.

## Verification

Node contracts cover all14 interpreted solutions,42 choices and28 route gates, failed attempts, unique rewards, retreat, progression locks and normalized reload. Quest-state tests cover11 scenario groups. The interpreter's95 programs/29 host escapes and the pronunciation/narration tests pass. Existing arcade, Iris, contact and approved-media checks are retained.

The shared arcade regression entry point calls the new Code Quest contracts; the already-landed Firefly and shared-voice functions remain intact. The Firefly page is not edited by this revision. Renderer source is frozen at SHA256 d35adaaf5224d017088c02e8b5e06f4a404a73827c4311ec300a494b892ca247; Canvas adapter ee702f4070fdfd4a50200b4e86875a2fe4a03a97774ed36ec9f17ccd46486247.

## Limits

Graphics are stylized procedural 3D with a Canvas fallback, not cinematic or photorealistic production assets. Mobile checks use emulation; physical iOS/Android devices and audible speaker listening are untested. Save normalization prevents accidental out-of-order progress; browser-local saves are not authenticated or cheat-proof. The teaching language remains a small bounded JavaScript subset, not general JavaScript execution.

## Desktop action visibility and deterministic capture

Version 20261102-stoneward2 reveals the full action stage on explicit Run/route actions at desktop widths as well as mobile, then returns to feedback and Continue. The stage fits short desktop viewports above the sticky header. Browser checks confirm active-scene and settled result/CTA visibility at 1165x800 and 1165x600. See desktop-active-stage-800.png and desktop-active-stage-600.png. Typing does not trigger automatic scrolling.

CI previously missed a brief animation window after a delayed click acknowledgment. Midpoint samples now pause the browser clock before the real pointer action, advance the actual RAF/performance timeline, and hold the real GPU-rendered pose through capture. Position, joint and decoded-pixel assertions remain. A separate stress run passed 47 assertions across three repetitions at 8x CPU slowdown with a deliberate 1500ms acknowledgment delay. This is controlled animation verification, not a wall-clock frame-rate benchmark.
