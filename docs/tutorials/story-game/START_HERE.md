# The Little Signal — a beginner branching story game

Original Kira Labs teaching example: five story nodes, three shape-drawn locations, two characters and two endings. It is deterministic JavaScript, **not an AI conversation, mocap capture, learned motion or a finished Kira World feature**. All artwork is drawn with CSS shapes. No game engine, model, external artwork or API key is required.

## 1. Download and open
Keep these three files together in one folder: `index.html`, `style.css`, `game.js`. Double-click `index.html` to open the game in your browser. A file named `index.html.txt` will not behave the same; show filename extensions in Windows File Explorer. Use a plain-text editor, not a word processor. Save, then refresh after each change. Make a backup before editing.

From GitHub, open each file and use **Download raw file**; save with the exact names. Do not download the GitHub page itself as HTML. `test.cjs` is an optional developer test, not needed to play. Five optional finished dialogue WAVs use Robert’s explicitly approved synthetic voice. Download the `audio` folder too if you want sound. The game remains fully playable with text if clips are missing or muted. No private voice reference recordings are included.

Controls: click/tap a choice, use Tab then Enter, or press number 1 or 2. R or Restart goes back to the park. Turn on the coordinate grid to see placement. Reduce motion skips optional wave/entry animation. System reduced-motion preference is also respected by CSS. These are controls, not proof of complete accessibility; test your own browser and assistive tools.

## 2. Know the files
- `index.html`: page structure, stage, dialogue, buttons and script/style connections.
- `style.css`: backgrounds, original stick figures, colors, layout and scripted animation.
- `game.js`: authored story data, scene switching, safe text display and optional audio.
- `test.cjs`: logic and simulated DOM/audio tests using Node's built-in tools.
- `test-results.txt`: recorded test output with its verification limits.
- `dialogue-manifest.json`: exact speaker/text/expected filename for optional recordings.

HTML loads CSS using `href="style.css"` and JavaScript with `src="game.js" defer`. `defer` waits until the document has been parsed before running this script. If a file is renamed, its reference must change too.

## 3. Name and color a character
Find `CAST` near the top of `game.js`. Mira and Sol are original fictional characters. The keys `mira` and `sol` are IDs; the `name` property is the label shown to players. You can change the label without changing all the IDs. `shirt` and `skin` are CSS color strings.

```js
mira: { name: 'Mira', shirt: '#367ba2', skin: '#d8a979' }
```

The CSS `.head`, `.torso`, `.arm` and `.leg` rules draw a simple figure. No photographs or generated identity references are needed. Maintain proportional body parts when changing size. This example does not show how to animate a 3D skeleton.

## 4. Place feet on the ground
Each scene lists its characters. For example:

```js
{id:'mira', x:30, y:78, facing:1, layer:3, pose:'wave'}
```

`x:30` means 30 percent across the stage. `y:78` means the feet sit 78 percent down from the top. The drawing code sets `bottom` to `100 - y`, giving 22 percent space below the feet. The ground begins at that same line. `facing:1` faces right; `-1` mirrors the complete figure left. `layer` sets z-index; larger values appear in front. The speaker has a gold marker under their feet.

Try changing x from 30 to 40, save and refresh. Use the grid. Keep the characters inside the stage and away from dialogue, which lives in a separate panel below. The validator permits x from 10 to 90 and y from 55 to 85, but these bounds are not a guarantee of a good composition. Inspect different screen sizes after edits.

## 5. Make three locations from shapes
The stage receives a location class: `park`, `workshop` or `rooftop`. CSS shows or hides the tree, hill, workbench, window and skyline and changes colors. The lantern is another shape. `description` gives an accessible text description of the scene; update it when you change the visuals.

Optional owned/licensed background image: put a file such as `my-park.jpg` beside your page, then use `background-image: url('my-park.jpg'); background-size: cover; background-position: center;` for the relevant stage class. `cover` preserves proportions but can crop edges. Remove or hide shape layers if they obscure your image. Keep the background color as a missing-image fallback. Use only pictures you may publish and update the scene description. This optional image variation is not part of the tested starter.

## 6. Script a wave, do not call it mocap
`pose:'wave'` adds a class. CSS rotates the right arm around its shoulder using `transform-origin` and `@keyframes wave`, over 1.5 seconds, twice. Entry moves the figure a short distance and fades it in. Animation durations use seconds, not a loop tied to frame counts. This is a simple authored movement, not captured human movement or autonomous control. It has not been empirically tested at different frame rates. Reduced-motion CSS and the checkbox disable optional animation; the checkbox also gives the waving arm a static raised pose.

In the earlier Motion Notes short, movement mapping and proportions were conceptual illustrations. This tutorial begins with simpler 2D authored poses; it does not claim that the earlier short supplied working retargeting code.

## 7. Write dialogue and a story map
The exact map is:

```text
park ──→ workshop ──→ ending-light
  │          └─────→ ending-stars
  └────→ rooftop ──→ ending-stars
             └─────→ ending-light
```

`SCENES` holds five nodes; there are only three visual locations. Endings reuse workshop or rooftop. Every scene has a title, location, speaker, description, dialogue line, characters and choices. A choice has visible `text` and destination `to`:

```js
choices: [
  {text:'Visit the workshop', to:'workshop'},
  {text:'Climb to the rooftop', to:'rooftop'}
]
```

`showScene` stops old speech, changes state, updates the background, draws characters, sets dialogue, replaces choices and moves keyboard focus to the heading. The display uses `textContent`, not visitor-controlled HTML. An ending has `ending:true` and an empty choices array; Restart remains available. `validateStory` catches unknown destination IDs, locations, speakers and some position errors. It is not a complete schema validator; add checks as your game grows.

## 8. Optional voice: finished clips or your own recordings
**The included WAVs are finished character dialogue in Robert’s approved synthetic voice, not private reference packs or voice-cloning models.** Mira and Sol are fictional characters; both use the same approved voice in this edition. For replacements, record yourself or use a voice you are authorized to distribute. Do not clone a real person without permission. This lesson does not require a voice-generation tool.

Keep the supplied `audio` folder beside `index.html`. If replacing clips, use the exact lines in `dialogue-manifest.json`, listen to every clip, and save:

- `audio/park.wav` — Mira
- `audio/workshop.wav` — Sol
- `audio/rooftop.wav` — Mira
- `audio/ending-light.wav` — Sol
- `audio/ending-stars.wav` — Mira

The file must actually be a browser-playable WAV, not just renamed from another format. Captions come from `scene.line`; ensure recordings match. Test pronunciation, volume, silence and every ending. User recordings are not covered by our test results.

The page starts muted. Click **Enable voice** to enable voice and immediately request the current line. The button then becomes **Mute voice**, which stops playback. **Play voice line** repeats the current line while voice is enabled. Selecting a story path with voice enabled requests its new line. `new Audio(scene.audio)` prepares a relative clip; `await clip.play()` may reject. Missing or rejected files leave the text game usable and show a fallback status. `stopAudio()` pauses and resets the old clip. `audioEpoch` is a sequence number so a late play promise cannot report an old scene as currently playing. Restart stops voice and never automatically narrates the opening line. Voice on/off is retained until refresh, not permanently saved. The playback element starts at volume 0.8; device settings and clip loudness still matter, so lower your device volume if needed.

Official playback reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play

## 9. Test and debug one change at a time
Try every route to both endings. Try rapid clicks, keyboard choices, Restart, grid and reduced motion. Test the supplied clips, then temporarily rename a clip in a local copy to verify the missing-file fallback. Add replacement clips only if permitted; test rejected playback, navigation before a line ends and quick Replay clicks. Inspect desktop and narrow screens; check that feet align and controls stay readable.

Common mistakes:
- Blank or unstyled page: check the file extensions and that all files share one folder.
- Choice fails: compare `to` with the exact scene key, including hyphens/capitalization.
- Broken script: restore the last edit; check quotes, commas and brackets.
- Wrong position: y refers to feet, not the head; x/y are percentages.
- Silent voice: use Enable voice, check that the `audio` folder was downloaded, and verify filenames, actual WAV format and browser permission. Silence is not proof of successful playback.

Optional automated tests with an already installed Node.js: open a terminal in the folder and run `node test.cjs`. Preparation passed 22 logic/DOM/audio-mock checks, including click-to-play, stop-on-navigation, restart, rejected play and stale promises. This does **not** verify actual browser graphics, real sound, mobile layout, assistive technology or model intelligence. Real-browser checks should be recorded separately.

## 10. Put your own copy on a website
Test locally first and review your hosting provider's rules yourself. For GitHub Pages, create your own public repository with a README, upload the three starter files at its root, and include only recordings you may distribute. In Settings → Pages, choose Deploy from a branch, main, /(root), then Save. Wait for deployment, use Visit site and test all branches again. No secret keys, private information or voice references belong in a public repository. A public repo exposes its source. No separate account or website was created for you by these instructions.

Official GitHub instructions checked November 1, 2026:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

The starter makes no service API requests and stores no saved progress. Local audio playback reads a relative file; when hosted, that requests the file from the host. Hosts may log page/file requests. The external Kira Labs link opens that site's own privacy context. This is educational code, not a complete security/privacy/accessibility audit.

Explore public project goals and limitations: https://kiralabs.org
