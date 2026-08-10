# Kira Labs hackathon test bundles

## Phase 3 — current

Download and extract:

`Kira_Labs_Hackathon_Phase3_Setup_Test_Bundle_20260810.zip`

SHA-256:

`513196800a28d6b29b5004189e2354db09f593f4413b9c92d3a1cdbf20e82b57`

Then double-click:

- `Start_Kira_Labs_Hackathon_Test_Center.bat` for synthetic local project tests.
- `Start_Kira_Labs_Provider_Setup_Assistant.bat` for guided Google, AWS, CockroachDB, and CALL-E account setup.

Phase 3 adds nine passing tests, secret-masked provider preflights, an AWS read-only STS/Bedrock check, a CockroachDB read-only SQL check, a CALL-E local configuration check, and an explicitly authorized minimal Google connectivity check. No real phone call is placed by these checks.

## Phase 2 — superseded for setup work

The earlier Phase 2 ZIP remains safe for local no-key tests, but Phase 3 is the current setup and testing package. Do not put credentials into either ZIP or commit a real `.env` file.
