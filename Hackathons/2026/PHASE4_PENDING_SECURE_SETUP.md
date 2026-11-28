# Phase 4 secure setup — local tested package

Status: `LOCAL_PACKAGE_TESTED_SOURCE_PATCH_PENDING_IMPORT`

A Phase 4 Windows bundle was built to replace the owner-facing environment-variable workflow with a secure first-run wizard.

## Completed locally

- Windows DPAPI CurrentUser encrypted storage for `GEMINI_API_KEY`, `CALLE_API_KEY`, and `DATABASE_URL`, outside the repository.
- Named non-root AWS profile and non-secret settings path.
- Secure setup wizard with masked fields, encrypted save/delete, current-user environment cleanup, provider status, and submission-readiness views.
- Gemini, CALL-E, CockroachDB, and Strands adapters updated to resolve secure configuration.
- One-click isolated `.venv` installer for optional provider SDKs.
- Secret scanner expanded for current Google, AWS, CALL-E, database, and private-key patterns.
- Eighteen local unit tests passed; Python compilation, the deterministic five-project toolkit, and the repository secret scan passed.
- No network request, phone call, database mutation, Kira World data access, or real credential was used in validation.

## Security incident boundary

A Gemini API key appeared in an owner screenshot and must be revoked. It is not present in this repository or the Phase 4 package. Only a newly created replacement may be saved through the secure wizard.

## Submission truth

No project is ready for final submission. The closest are Kira AccessLine, Kira Memory Steward, and Kira Project Truthkeeper. Each still needs its real sponsor-provider test, dedicated licensed repository, deployable application, architecture diagram, demo video, and final Devpost materials.

## Import boundary

The tested Phase 4 source patch is packaged separately for later review/import. Do not mark the GitHub branch as Phase 4 complete until those exact source files are imported and the tests are rerun on the branch.
