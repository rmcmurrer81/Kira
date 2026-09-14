# Iris free upgrade and Muse site audit — September 14, 2026

## Status: test branch only, not a live service

Prepared at Robert's request with a strict $0 service constraint. Live website main is based on `6f0c194cca852e3bd48d2883cc2b7f65f241223c`. The earlier archive `archive/kiralabs-before-publication-2026-09-14` is not changed. No private backend, AI account, new email sender or transcript collection has been activated. Existing FormSubmit delivery and public call/text number are unchanged.

## What is built

- Optional model-assisted question matching: a fixed Workers AI model selects relevant IDs from the full reviewed source bank; server code returns the approved source text, not invented model prose. This is a deliberately grounded first step, not an unrestricted chatbot or proof that every paraphrase works.
- Full existing books/credits/project knowledge is assembled and integrity-checked using the original pack loader, then the approved public-site policy is applied. Current readable public pages are included. Original bank files are not edited or replaced.
- Separate choices for hosted processing, sharing future questions/replies with Robert, and remembering the chat on a visitor's device. All default off.
- Private D1 records with 30-day maximum retention, same-session deletion, vote feedback and deletion tombstones to stop late in-flight writes after deletion. No visitor records, secrets or database dumps go into GitHub.
- Monday weekly email to **rmcmurrer@kiralabs.org**, covering the previous complete Monday–Sunday UTC. Cron is Monday 13:00 UTC (9 a.m. during Eastern daylight time; 8 a.m. during standard time). There is a separate daily cleanup job. These jobs run only after the private Worker is actually deployed and enabled.
- Exact recorded message/session counts, top topics, unresolved questions and selected helpful/not-helpful feedback. Sessions are not unique people; the report covers opt-in enhanced conversations, not all site visits. Common identifiers are redacted where detected, not guaranteed anonymized.
- Authenticated owner CLI to review records, approve sourced knowledge revisions and roll back a revision. Visitor text never automatically becomes a fact. This first release supplies a review queue, not an autonomous FAQ publisher or a finished owner dashboard.
- Existing guide, contact form, voice controls, phone number, dark styling and picture timeline remain available. If enhanced matching is unavailable or limited, the client returns to standard Iris.

## No-spend boundary

Pricing was checked September 14, 2026 against official sources:

- https://developers.cloudflare.com/workers-ai/platform/pricing/ — Free plan has a daily allowance; exceeding it fails rather than purchasing overage. Selected model: `@cf/meta/llama-3.1-8b-instruct-fp8-fast`. No AI Gateway, prepaid credits or paid-model fallback.
- https://developers.cloudflare.com/workers/platform/pricing/ — Use **Workers Free**, not Workers Paid. The existing website stays on GitHub Pages.
- https://developers.cloudflare.com/d1/platform/pricing/ — Free-plan query/storage limits fail closed. No automatic upgrade.
- https://developers.cloudflare.com/turnstile/plans/ — Use the free Turnstile plan.
- https://resend.com/docs/knowledge-base/what-is-resend-pricing — Free transactional plan, no overage available. A weekly owner report is far below its allowance.
- https://docs.github.com/en/actions/reference/runners/github-hosted-runners — Standard runners in this public repository are free. Review workflow uses standard Ubuntu only; no paid larger runner, artifact hosting or deployment service.

Application caps: 100 model requests/day, 500 enhanced chat requests/day, 200 saved records/day, 30 chat requests/session/day, 10 new sessions/network/day and 300 sessions/day total. Prompts are at most 12,000 UTF-8 bytes with 180 output tokens. These are conservative application limits, not a billing-plan detector. Other apps can consume shared account allowances. The account **must actually remain on Free**; the config flag is an operator acknowledgement, not proof of provider billing status. Never enable this on a paid account assuming the flag changes its plan. Stop if an activation screen requires payment, a card, prepaid credit or an upgrade.

## Required free-account setup before activation

1. In a Cloudflare **Workers Free** account, create D1 database `iris-private`. Use the returned ID in `services/iris-free/wrangler.jsonc`. No domain migration is needed; use the supplied workers.dev endpoint.
2. Create a free Turnstile widget limited to `kiralabs.org` and `www.kiralabs.org`. Put its public site key into the client config; save its private secret only as a Worker secret.
3. Connect/create **Resend Free** and verify a sender subdomain such as `updates.kiralabs.org`. Do not replace the existing site's CNAME or receiving-email MX records. Add only the sender-validation DNS records after review. The current FormSubmit activation is unrelated and must not be repeated or changed.
4. Save `SESSION_SECRET` and `OWNER_TOKEN` as independent random values of at least 32 characters, plus `TURNSTILE_SECRET` and `RESEND_API_KEY` using Wrangler secret storage. Never put them in source code, a public issue, a URL or this conversation.
5. From a full repository checkout run `node tools/apply-iris-site-audit.cjs`, `node tools/build-iris-knowledge.cjs`, `node --test tests/test-iris-free.mjs`, `node tests/test-iris-bank.cjs` and `python3 tests/test-site-audit.py`.
6. Use Wrangler to apply `schema.sql` to the private D1 database and deploy the Worker. Keep `SERVICE_ENABLED`, `FREE_PLAN_CONFIRMED`, `DIGEST_ENABLED` and the frontend `enabled` flag false until provider plans are verified and setup is complete. Then explicitly enable the Worker on the review build first.
7. Test real AI matching against original questions/credits/books, first-use Turnstile, opt-in/no-opt-in records, private deletion, the daily cap and a test digest. A Resend API acceptance is not proof of inbox delivery; Robert must confirm receipt in the Kira Labs mailbox. Verify performance against the Workers Free CPU limit. Then set the tested HTTPS endpoint and Turnstile site key in `docs/iris-enhanced-config.js`, enable it, and publish only after review.

Example CLI setup after a free account is authorized (these commands have NOT been run against an account):

```sh
cd services/iris-free
npx wrangler@4 login
npx wrangler@4 d1 create iris-private
# Set the returned database ID in wrangler.jsonc, then:
npx wrangler@4 d1 execute iris-private --remote --file=schema.sql
npx wrangler@4 secret put SESSION_SECRET
npx wrangler@4 secret put OWNER_TOKEN
npx wrangler@4 secret put TURNSTILE_SECRET
npx wrangler@4 secret put RESEND_API_KEY
npx wrangler@4 deploy
```

No Cloudflare account connection was available to this chat when the branch was prepared. Resend connection was offered. Therefore hosted inference, database provisioning and weekly delivery remain **not enabled**.

## Owner review

Set `IRIS_ENDPOINT` and `IRIS_OWNER_TOKEN` in a local terminal, not in public CI. Run:

```sh
node tools/iris-owner.mjs review
node tools/iris-owner.mjs revisions
node tools/iris-owner.mjs digests
node tools/iris-owner.mjs approve my-reviewed-answer.json --confirm
node tools/iris-owner.mjs rollback REVISION_ID --confirm
```

Approval JSON needs `topic_id` (letters/numbers/hyphens), `title`, `text` (maximum 2,200 characters) and an existing public Kira Labs `source_url` ending in .html with an optional anchor. Publish/review the supporting source before approval. Approved entries are private until returned as public answers. The latest 20 active additional answers are included in matching; keep the main public bank maintained for larger additions.

Review CLI output contains private visitor feedback. Do not post it in this public repository. Weekly sends are claimed atomically and use a fixed owner recipient and provider idempotency key. Uncertain sends are marked for owner review rather than blindly retried. Scheduled sending is not an inbox-delivery guarantee. No applicant/employer/budget details are required to contact Robert.

## Muse audit outcomes

- The Kira World sentence was plain text, not two links. It now links “dated evidence” to readable updates and “ask Robert” to Contact.
- Notebook Worlds already had a nonempty URL. The original asset remains. Invalid `</img>` markup was removed. URL presence/source-tree verification is not a new live image-rendering test.
- Footer Contact links already existed, and About already had an internal Contact route. Footer navigation is expanded to all main pages; in-content Contact links are added to the homepage, projects and product pages. Mobile navigation has a no-JavaScript fallback.
- Support conversation/timeline and readable-update anchors are checked, without changing their intended destinations. Dynamic timeline choices remain picture-based with details underneath.
- Sarah Travel now distinguishes itself from both Iris and ShiftBrief's Sarah.
- About has a small factual press introduction and existing professional-profile/portrait links. The portrait is explicitly AI-assisted; external reuse still requires Robert's permission.
- Main header wording is standardized to Independent R&D; selected creative/travel labels are aligned. Project status/limitations are retained.

## Validation and remaining uncertainty

Local tests use real SQLite for D1-compatible SQL and a real Chromium DOM, but mock external model, mail, Turnstile and original-guide responses. The managed browser blocked navigations, so page DOM was loaded in memory. No live model result, actual Cloudflare CPU usage, external image/video playback or new email delivery is claimed by those tests. Full source-bank assembly is checked in the GitHub workflow against the original preserved repo files.

Keep the public enabled flag false until the live-service acceptance checks pass. No existing archive or main branch is changed by this review workflow.
