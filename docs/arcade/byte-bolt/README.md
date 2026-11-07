# Byte & Bolt: learning-town campaign

A dependency-free browser game with eight connected beginner programming/electronics projects: five paid town jobs and three personal lab upgrades, an explorable 3D town, local saves and changing practice contracts. This is an eight-project campaign, not the whole eventual game or an unlimited open world.

## Play

Open `index.html` in a modern browser or serve this directory with a local static server. The hosted website is the simplest option when available. Use WASD/arrows and E, touch controls, destination buttons, or the project board. All jobs can be reached without walking.

1. Paid town job: repair the delivery robot with a missing-reading safety rule.
2. Personal lab upgrade: calculate a minimum LED resistor, select an E12 resistor, and calculate current.
3. Paid town job: convert ultrasonic round-trip time into distance.
4. Paid town job: protect a community-greenhouse pump with three-condition logic.
5. Personal lab upgrade: calculate a solar-monitor voltage-divider output, including a case above 3.3 V.
6. Personal lab upgrade: control your lab’s cooling fan using remembered state and hysteresis.
7. Paid town job: estimate ideal battery runtime from watt-hours, volts and amps.
8. Paid town job: commission a delivery gate with multi-signal interlocks.

Paid town jobs fund every required part without grinding: start with 20 credits and finish with 95. Purchases deduct credits. Your own LED, solar-monitor and cooling upgrades do not pay you for improving your lab. Completed projects visibly restore the town. Mentor quest markers follow the next available or active project. A mentor’s marker disappears when their current project ends, then returns if they have a different project later. For example, Iris’s robot job is followed by Evelyn’s LED upgrade; Iris then returns with echo calibration. Practice does not generate a new-job marker. Visiting a mentor without current work points you to the next mentor and keeps the project board available. Milestones earn a workbench, custom input probe, solar roof, cooling station and town-engineer badge.

Completed projects offer repeatable practice with varied parameters or inputs. The first three completions per project earn one mastery star each (24 stars total). Personal-upgrade practice never awards credits. For each of the five paid town jobs, the first three repeat service contracts also pay eight credits each; later service practice is unpaid. Practice continues up to 100,000 stored completions per project. At that history limit the normal bench remains available. Parameter combinations are finite and will eventually repeat. Fixed boundary and fault cases stay in every relevant test set.

## Saves and audio

The browser storage key remains `kira-town-prototype-v1`. Valid old version-1 saves migrate to version 2 and preserve credits, parts, acceptance, position and both original jobs. No earlier campaign rewards are paid twice, and no previously earned credits are clawed back. An old two-job save with 65 credits retains all 65 and can finish the revised campaign with 120; a fresh playthrough finishes with 95. Export/import JSON backups in Save & sound. Unreadable saved data is not automatically overwritten; explicit import or reset permits replacement. Saves are local to the browser/origin, not synchronized between devices. The active job is saved; valid positions now extend to ±20 on both ground axes.

The original 12 recorded clips remain in `audio/` with their notices. They are newly designed prototype voices, not recovered identities for Robert, Iris or Evelyn. Only matching original dialogue uses those recordings. New campaign dialogue uses captions and, optionally, installed local English system voices. No new prerecorded campaign voices or cloud voice requests are included. The obsolete two-job ending is not used.

## Honest boundaries

The editor interprets one bounded expression beginning with `return`. It supports listed input variables, numbers, booleans, undefined, arithmetic, comparison, logical operators and parentheses. It never calls eval, Function, arbitrary user code or the network. It does not support loops, assignments, function calls, arrays, objects or full JavaScript programs.

The 3D effects illustrate progress, not physical electronics. Circuit and controller exercises are simplified low-voltage lessons, not real hardware safety guarantees. There is no Jetson project, motor-physics simulation, real purchase, account, multiplayer or cloud save.

## Source and checks

- `core.js`: safe expression interpreter, eight jobs, varied contracts, economy, save validation/migration.
- `app.js`: project board, test benches, lessons, sound and save controls.
- `scene.js`: small WebGL town with a 2D projection fallback and visible upgrades.
- `index.html`, `style.css`: responsive shell and accessible panels.
- `BUILD_GUIDE.md`, `learn.html`: beginner-oriented source guide.
- `tests/test-original.cjs`: original regression coverage updated for the new save version and the unpaid personal LED upgrade.
- `tests/test-campaign.cjs`: campaign, migration, reward and parser tests.
- `tests/test-browser.cjs`: local Chromium UI suite; requires Playwright and Chromium in the test environment.

Run logic checks with Node:

```
node --test tests/test-original.cjs tests/test-campaign.cjs
```

Browser QA command:

```
node --test tests/test-browser.cjs
```

The isolated development run passed all 37 logic checks, including correct solutions for 48 practice rounds per project, exact cash flow after every purchase/completion in fresh and migrated saves, and recurring NPC markers. The browser suite was initially blocked before launch by the environment’s Chromium socket restriction; see the integration QA result for subsequent browser verification. A blocked browser run is not a UI pass.

The town now includes a 40×40 explorable map with camera follow, zoom, detailed stylized buildings, a pond, gardens and residential scenery. These districts do not add hidden jobs or interiors. See RELEASE_QA.md for current checks.

The original two-job source is preserved separately as Byte-and-Bolt-Part1-Source.zip for tutorial reproducibility.
