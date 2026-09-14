# Kira Labs website redesign — review build

**Do not merge or deploy until Robert approves the visual review.**

## Preserved live baseline
- Repository: `rmcmurrer81/Kira`; website files: `docs/`.
- Original main commit: `5fb345f72852d180b0c4b25a4c1bb83215ace6a7` (includes ShiftBrief release update).
- Backup branch: `backup/kiralabs-before-redesign-2026-09-13`.
- Review branch: `kiralabs-redesign-v2`.
- Main, GitHub Pages settings, CNAME, existing images, legacy Sarah scripts, old knowledge packs and original progress-data.json are not changed by this review.
- Original knowledge.html is preserved byte-for-byte as knowledge-archive.html.

## What changed
Ten static pages: lab homepage, Kira World, ShiftBrief, projects, About, lab timeline, Support, Contact, source notes and website privacy. Shared CSS and small browser-only scripts have no framework, model provider, account or tracking dependency.

The timeline retains all 18 original milestone IDs and adds 11 broader lab entries (29 total). Seven project filters, progress-state filtering, search, date ordering, selectable evidence details and previous/next navigation cover the whole lab. Publication dates are not treated as implementation dates; undated work stays undated. The complete record is readable without JavaScript.

Iris is the optional **website guide**, not a Kira World resident and not Sarah in ShiftBrief or Sarah Travel. She selects reviewed public answers and shows source/contact links. Existing richer Sarah catalogue and technical notes remain archived rather than silently erased. No model service or private runtime is connected.

## Contact delivery boundary
No server-side form endpoint was supplied. The form is explicitly an **email-draft helper**: it creates a mailto link or copyable text. The visitor must send in their own email service. It never claims delivery. JavaScript-disabled visitors get the direct, selectable public email; the helper cannot submit fields without its handler. A real sending backend is a separate future configuration task, not something this preview pretends to have.

## Validation completed during preparation
- JavaScript syntax checks.
- 328 automated HTML/DOM/layout/interaction checks in Chromium, including all ten pages at 320, 390, 850 and 1440 pixels.
- Timeline filters, empty results, previous/next, old milestone and hardware anchors, undated future goals.
- Email draft encoding and explicit no-delivery state; no form fields in the page URL.
- Iris identity, installation/backup context, unsupported-question handoff, press routing, inert HTML input and delete-chat behavior.
- No-JavaScript timeline, mobile navigation and direct email.
- Original image paths independently verified against the existing GitHub assets tree. Their bytes are retained, not regenerated.

The isolated review browser could not navigate external or file URLs. Layout/interaction tests therefore used the exact HTML/CSS/JS in an in-memory DOM. Original image bytes were not visually retested, live hosting was not redeployed, email was not sent, and ShiftBrief was not reinstalled. These are explicit remaining review boundaries, not successful tests.

Portable structural check after checkout:
```sh
node tests/test-kiralabs-redesign.cjs
```
For a full visual review, serve `docs/` locally (`python -m http.server 8000 --directory docs`) and open the homepage, timeline, ShiftBrief and Contact pages on desktop and phone widths. Check the retained original images, public download destinations, keyboard behavior and the browser's own email-app handoff. Do not replace the live site merely to obtain a preview.

## Approval and rollback
Before merging, compare current main again so later Codex changes are not overwritten. Obtain Robert's explicit approval. Keep the backup branch.

If the approved redesign is later reverted, restore the **website files affected by the redesign** from the backup using a new reviewed commit, or revert the redesign merge. Do not force-reset the whole Kira repository: it also contains unrelated robotics and other work.

## Sources and editing
Design basis: Robert's supplied September 2026 Muse homepage-copy/contact-tab PDFs, with his requested lab-wide timeline and website-guide rename. Public factual basis: pinned existing site/notes, repository history and ShiftBrief 0.1.0 release metadata. No private messages, private project records or personal-profile memories were published.

Edit labs-data.js and the static timeline fallback in progress.html together. Status changes require a dated public source; future goals must not acquire invented deadlines. Update Iris's reviewed answers when relevant public page facts change. Keep the archived sources available.
