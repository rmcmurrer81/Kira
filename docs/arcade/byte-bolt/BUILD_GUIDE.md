# Build the first playable town: source walkthrough

This guide explains the complete supplied prototype. It is preparation for a future narrated tutorial, not a claim that the video is finished. You can inspect, copy and modify every source file in the package. No framework, dependency installation, API key, voice subscription or build step is required.

## 1. Start the page
Open `index.html`. It loads `style.css`, then `core.js`, `scene.js`, `audio-map.js` and `app.js` in that order. The core knows game rules, the scene knows geometry, and the app connects the rules to controls. Keeping those jobs separate lets you test logic without a graphics card or browser.

The HTML gives the canvas a text description, labels all buttons, and includes a dialog container. CSS fixes the canvas and controls to the viewport. `100dvh` uses the available dynamic browser height on phones. Small-screen rules shrink the objective and controls. The dialog has its own scroll region, so the webpage itself stays still.

## 2. Draw an actual 3D scene
In `scene.js`, every part has x, y and z coordinates. x/z lie on the ground; y is height. `box()` builds each cuboid from faces. The WebGL vertex shader projects these 3D points onto an angled, orthographic view. A depth buffer hides surfaces behind nearer ones. Different face brightnesses give the town readable form.

If WebGL cannot be created, the same world coordinates are projected into a 2D canvas and drawn as sorted polygons. That is a compatibility renderer of the 3D geometry, not a set of animated pictures. It is approximate: complex overlapping geometry can reveal painter-order artifacts. This first town deliberately uses simple cuboids.

`requestAnimationFrame(frame)` drives motion. The elapsed time is capped to prevent a huge movement jump after a tab pauses. The movement vector is normalized so diagonal movement is not faster. `allowed()` rejects positions inside the building footprints and outside the map. Character legs and arms change with a sine wave while walking.

Try changing a building's `c` or `roof` color. Then change its width and confirm that the collision footprint changes with it. Keep doors and NPCs outside their building collision rectangles.

## 3. Add jobs with state, not a maze of pages
`core.js` creates a new state with 20 credits and no parts. `app.js` chooses the current objective from that state. The yard offers a job, the store sells its required part, and the lab unlocks only after the repair. Each scene interaction opens a panel inside the game.

A boolean such as `repair` records permanent completion. The award function checks that flag before adding credits. This prevents a repeated click or repeated visit from creating endless money. Inventory also rejects duplicate purchases. The game contains no real payment integration.

## 4. Teach a real JavaScript function
The player writes a function body:

    return distanceCm === undefined || distanceCm < 20;

`undefined` means no usable echo in this exercise. `===` is a strict comparison; `||` is logical OR; `<` is strictly less than. The five cases check undefined, 0, 19, 20 and 45 centimetres. Exactly 20 is an important boundary: it must return false, while 19 returns true.

Do not call `eval()` on learner input. The prototype's `compile()` tokenizes a small expression grammar and builds evaluators for values, parentheses, comparisons, AND and OR. It rejects function calls, assignments, strings, extra statements and unknown identifiers. It models these supported JavaScript expressions, not the whole language. `testCode()` requires a boolean result, so a truthy number cannot pass as true.

The initial incorrect rule omits the undefined check. Press Run to see why its missing-echo test fails, inspect the hint or tablet, then repair the expression. For additional lessons, define expected cases before writing the UI. Include boundaries, invalid input and failure feedback.

## 5. Connect the electronics lesson carefully
The HC-SR04 uses the time between a trigger and an echo. At approximately room temperature:

    distanceCm = durationMicroseconds * 0.0343 / 2;

The division by two accounts for the outgoing and returning sound. Temperature and surfaces affect results. A timeout is invalid data; it must not be interpreted as a clear path. The tablet's Arduino snippet assumes a classic 5 V Uno, requires pin modes in setup, and is deliberately labeled incomplete. A 3.3 V board needs proper echo-voltage conversion. The game does not claim to drive real motors safely.

For the LED job, the example assumes a 5 V supply, a 2 V red-LED drop and a 15 mA target. Ohm's law gives `(5 - 2) / .015 = 200` ohms. A 220-ohm series resistor gives about 13.6 mA and dissipates about .041 W. A 1000-ohm resistor is safe but dimmer; the game distinguishes this from the too-small 100-ohm choice. Always use the real device's ratings in a physical build.

## 6. Preserve progress
The app serializes state as JSON to localStorage. It also exports the same JSON to a downloaded file. Import validates type, version, bounds, item IDs, duplicates and basic progression consistency, then asks before replacing the current state. It copies only known fields; unrelated keys are not imported into the application.

No browser storage is guaranteed permanent. Private browsing, local-file rules, user clearing, quotas and browser changes can affect it. Test export and import, not just autosave. A cloud-save feature would require a separate design and privacy decision.

## 7. Add authorized voices locally
Main dialogue uses three new original voices generated with a locally installed voice-design model, not recovered Robert, Iris or Evelyn identity recordings. Only finished game dialogue is bundled, never training material or model weights. See the bundled audio provenance for generation and license details.

`audio-map.js` matches each character and dialogue prefix to a local WAV file. `app.js` plays that file after a user enables read-aloud. Changing panels, closing a panel, muting, hiding the page or leaving it stops playback. Unmatched text falls back only to a browser voice marked `localService`; captions work without speech support. No external voice API is used.

To add a line, generate an authorized recording locally, add a mapping with a unique text prefix, and include the file in the offline ZIP. Check each file's format, duration and level, and listen for pronunciation and continuity before a polished release. Synthetic voice identity continuity is best effort in this prototype.

## 8. Test and expand
With Node installed, run from the extracted folder:

    node --test tests/test-byte-bolt-core.cjs
    node --check app.js
    node --check scene.js

Play through a wrong answer, correct answer, repeated submission, purchase, duplicate purchase, second job, reload, export, reset/cancel and restore. Test keyboard and touch-sized layouts. Check that dialogs close and restore focus, and that no overlay is hidden behind the town HUD.

To expand without breaking saves, add explicit save migrations rather than silently treating old data as new. New items should have verified compatibility and actual purposes in playable jobs. Add new lessons one complete job at a time, with tests and a reproducible code walkthrough before recording the video.
