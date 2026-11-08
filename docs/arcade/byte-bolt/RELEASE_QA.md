# Voice compatibility repair — 8 November 2026

- Reproduced the live Iris conversation failure in a managed Chrome browser: pressing Read aloud displayed “No local English voice found. Complete captions stay on.” This reproduces the missing-voice path, not the user's exact laptop or fan behavior.
- 69 Node checks pass, including 9 new audio groups and a render-pause check. All 505 current full-dialogue combinations and authored practice variants resolve to bundled clips. Existing campaign, migration, economy, parser and scene checks remain covered.
- Generated 318 short MP3 segments with stock Kokoro af_sarah, locally at build time. No private reference voice was used. The original twelve WAV recordings are preserved and selected only on an exact transcript match. The player never calls browser TTS or runs a model.
- Read-aloud remains opt-in, with a saved setting, Test voice, truthful loading/playback/error statuses, cancellation on panel changes/hide and bounded load timeouts. Scene drawing pauses under dialogue/map panels; normal graphics and active rendering frame rates are unchanged.
- Real-media browser checks are run by Byte and Bolt voice compatibility QA. Check the exact commit's workflow outcome. Node mocks and clip existence alone do not prove audible output, laptop performance, human pronunciation quality, or device compatibility.
- No new human listening review, real-laptop test, measured fan/noise result, or disconnected local-file play is claimed.

## Previous campaign QA (retained historical record)

# 22-project town release checks — 7 November 2026

## Verified
- 59 Node regression groups pass: 46 campaign/original and 13 scene checks. Includes all 22 distinct project solutions, misconception cases, fresh and migrated cash flow, 300 mixed contracts, no consecutive topic families, old-save migration, strict expression parsing, scene recovery, player facing, NPC markers and map travel.
- Managed browser continued an existing eight-project save with 208 credits through all 14 new projects. Final balance was 523 credits; reload retained 22 completed projects. Existing mastery was retained.
- The first new service project paid 35 credits. The next personal PWM project paid nothing. A later personal LED mastery contract earned one star and no credits, then offered a different echo topic.
- Sam's assigned-job marker appeared in East Village, disappeared after completion, and ordinary conversation remained available. His dialogue pointed to the next mentor. Nora's idle conversation was also tested.
- The expanded town spans 120 by 120 world units, nine times the previous 40 by 40 area. Five map travel destinations connect the town center and outer neighborhoods. Map travel, keyboard walking and character facing were inspected in the compatibility renderer.
- The map and conversation panels fit a 390 by 700 mobile-sized frame. Map text contrast was corrected after visual review. A real touch device has not been tested.
- Approved-image protection and public-contact regression checks pass. The original four arcade cards and original Part 1 archive are preserved.

## Limits
- Play duration has not been measured with learners. There are 22 distinct authored projects; repeat parameters are finite, not unlimited new missions.
- Hardware WebGL rendering and performance on mobile devices still need device testing. The compatibility renderer was visually inspected.
- New dialogue uses captions and optional installed local speech. No new voice recordings or human pronunciation review are claimed.
- The ZIP is self-contained, but disconnected local-file play remains unverified for this revision. Export save backups.
- The original eight project rules have regression coverage and prior browser checks; this integration's browser walkthrough focused on all 14 additions, conversations, map travel and mixed practice.
- This remains an expanding game, not the entire long-term vision or a full JavaScript runtime. The tutorial video is a separate deliverable.
