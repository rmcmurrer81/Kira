# Kira Labs approved website publication — September 14, 2026

Robert explicitly approved publication of the final Iris Routing Fix website, while retaining the old website as an archive.

## Preserved old website

- Archive branch: `archive/kiralabs-before-publication-2026-09-14`
- Old live commit: `5fb345f72852d180b0c4b25a4c1bb83215ace6a7`
- Old root tree: `15f2466905a10b0d96c60b720bd4be87eb6a60c9`
- Old complete website subtree: `d9ad3196827e7e7364857628c4bc9531a1846398`
- An earlier backup also exists at `backup/kiralabs-before-redesign-2026-09-13`.

Do not delete or move the archive reference. It retains the complete repository state, including all original HTML, CSS, JavaScript, images, knowledge records, domain file and workflows.

The archive is a GitHub branch, not an additional public website section. Failed hackathon projects remain excluded from the newly approved public pages and timeline.

## Approved publication source

`Kira-Labs-Iris-Routing-Fix-Website-Files.zip`, folder `Kira-Labs-Review/docs/`, from the final approved conversation attachment.

The 24 non-`labs.css` files are copied byte-for-byte from that folder. The stylesheet is packaged as `labs-base.css` plus `labs.css`: expanding the leading import reconstructs the approved stylesheet byte-for-byte, in the same cascade order. No styling declarations were changed. The sitemap now lists the new readable public pages; the contact return page is intentionally excluded.

Original assets, CNAME, .nojekyll, the complete knowledge directory, the original Sarah engine/pack loader and JSON knowledge files remain unchanged. Iris validates and uses those preserved source files. Unrelated robotics code and GitHub workflows remain unchanged.

The user confirmed activation and a delivered test for the FormSubmit recipient `rmcmurrer@kiralabs.org`. The service endpoint and submission logic are retained unchanged. Public call/text number: `(317) 586-8199`.

## Validation scope

Before publication the approved local regression suites passed: 182 credit-routing fixture checks, 162 picture-timeline/static checks, 17 policy checks, and profile-link assertions. These are not new proof of external video playback or email delivery. Upload blob hashes were compared with the approved files; stylesheet expansion was verified as exact.

Do not merge draft PR #3 as a deployment: it contains an earlier rejected visual direction, not this final approved revision.

## Safe website-only rollback

First preserve the current main commit on a new backup branch and inspect any later work. Then create a normal new commit replacing only the root `docs` tree with the archived subtree `d9ad3196827e7e7364857628c4bc9531a1846398`. Leave all other root entries intact. Fast-forward main to that restoration commit and verify the Pages deployment.

Do not force-reset the whole repository to the old commit: that could discard unrelated work added after publication. Do not change the domain, recipient activation or repository permissions for a visual rollback.
