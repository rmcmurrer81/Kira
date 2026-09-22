# Research video library — September 22, 2026

Entry point: `/research.html#watch-videos`.

- Two static, separately labeled collections directly below the Research hero.
- Watch routes on the homepage (hero and research section).
- Native YouTube playlist players load only after a visitor chooses a cover.
- Direct YouTube links remain available without JavaScript and during playback.
- Only one embedded collection is active at a time. Close removes the frame.
- The existing timeline, research copy, project status, and movie files are unchanged.
- No extra banners or labels are added on top of playing videos.

## Supplied links and verification boundary

Medical: `https://www.youtube.com/playlist?list=PLb9jDoJkzkPk`

Digital Twin: `https://www.youtube.com/playlist?list=PLYTbQe_kCHYw`

These are the exact links supplied by the owner. They are short and have not
been verified against YouTube. Browser-tool retrieval failed; local network
access is unavailable; search and prior context did not provide full replacement
IDs. Do not guess missing characters or claim the collections have been verified.
The explicit channel fallback uses the previously supplied `@mcmurrer` channel.

The local tests verify layout, keyboard interaction, delayed iframe creation,
correct URL construction, close/reset, and fallback links. They do NOT verify
remote playback, playlist privacy, embedding permissions, or current membership.

To correct a link when the owner supplies a confirmed URL, update BOTH anchors
in that collection in `docs/research.html`. The player reads the cover's href,
so there is no separate hard-coded JavaScript ID to synchronize. Update the
exact-link test as well. Episode titles are editorial listings, not scraped
playlist membership; no individual video IDs or sequence indices are guessed.

## Offline checks

`python -m unittest discover -s tests -p 'test_research_video_library.py' -v`

`node --check docs/research-videos.js`

The embed format follows Google's official playlist parameters:
https://developers.google.com/youtube/player_parameters#Selecting_Content_to_Play
