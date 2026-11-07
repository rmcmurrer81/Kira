# Byte & Bolt: early town prototype

Working title, not approved final branding. Separate from Circuitbound.

## Play
Extract the ZIP completely and open index.html in a current browser. This self-contained package is designed to work without internet access. Actual file:// launch could not be verified in the testing environment. If your browser restricts local files, serve this folder from a local static server. Node is optional and only needed for the supplied tests. There are no package installs or external assets.

Move with WASD/arrows or touch controls; use E to interact. Destination buttons are instant travel shortcuts. Meet Iris, accept the robot repair, buy the HC-SR04, write and test the stopping rule, then buy the LED kit and complete the lab lesson. Rewards are paid once. Two complete jobs are included, not the whole planned game.

Progress saves in this browser when storage is available. Export a JSON backup from Save & sound, especially in local-file mode. Import asks before replacing progress. Read aloud enables optional recorded character dialogue. Captions always remain visible.

## Voices
Three new original prototype voices were generated locally. They are not the previously established Robert, Iris or Evelyn voice identities. Only generated game lines are included. No private voice-training material, voice model weights, or external speech API is included. See audio provenance for details. Unmatched lines may use an installed English voice that the browser marks local.

## Learn and test
Open learn.html or BUILD_GUIDE.md for a source walkthrough, not a completed tutorial video. Run `node --test tests/test-byte-bolt-core.cjs` for core regressions. Source is readable HTML/CSS/JavaScript, with no build step. GPU WebGL and actual offline file launch still require device testing; cloud browser QA exercised the CPU compatibility renderer. Electronics are simulated, with board-voltage and real-hardware safety caveats inside the tablet.
