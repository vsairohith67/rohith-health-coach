# RC8 unattended preparation report

Prepared: 2026-08-31

Branch: `codex/rc8-unattended-prep`

## Status

**RC8 PREPARATION COMPLETE — READY FOR USER ACTION**

This means every authorized non-interactive local/read-only task is complete. It does not mean RC8 is deployed or ready to ingest real health data.

## Gate summary

- Public Git history: `PUBLIC_REPO_HISTORY_SCAN = PASSED`
- Confirmed public-history secret exposure: none
- `RC8_REAL_DATA_GATE`: not blocked by secret exposure
- GitHub/Supabase/Vercel hosted readback: complete, read-only
- Production source: RC7 commit `3c32bdfb773ea23601eccad8b2f4af4646b3ec4c`
- Hosted mutations during unattended work: none
- Owner device-token flow: locally fixed and green; hosted deployment still required
- iPhone Shortcut guide: ready, placeholders only, five allowed metrics, Steps excluded
- Step source diagnostic: ready, local display only, no upload
- Garmin MCP: conditional RC9 local read-only candidate; unauthenticated and disabled
- MCP hosting: local stdio only if later approved; no tunnel or host deployed
- Local synthetic regression: passed
- Real-data pilot: not started

## Prepared source changes

- Added owner create/rotate/revoke/list credential RPCs with server-side randomness, HMAC-only storage, safe hinting, seven-day expiry, serialized ownership checks, one-unrevoked-token enforcement, and narrow grants.
- Added authenticated Production UI and a fail-closed Demo Mode page at `/settings/ingestion`.
- Added 36 RC8 pgTAP assertions and a loopback-only zero-sample runtime verifier.
- Corrected the iPhone guide and mapping to the actual strict snake_case ingestion contract.
- Added the Step source-identity diagnostic and Garmin/MCP architecture decisions.
- Added a repeatable private-data scanner and RC8 release tooling/version metadata.

## Remaining hosted gate

`RC8_DEVICE_TOKEN_READINESS_REPORT.md` remains **BLOCKED — FIX REQUIRED** for Production because the prepared credential migration and UI have not received exact-head CI, merge, hosted migration, and Vercel deployment. No real owner credential can be created through the current hosted RC7 application.

## Disabled state

- real health data: disabled / not ingested
- phone automation: disabled
- iPhone Shortcut on device: not created
- Apple Health permission: not requested
- AI: disabled
- MCP: disabled
- ChatGPT: disabled
- Codex health access: disabled
- Garmin cloud API: disabled
- Garmin MCP authentication: not performed
- FIT upload: not performed
- paid services: no change

## Stop point

Work stopped before Production credential issuance, owner email interaction, iPhone control, Apple Health access, the first real sync, Garmin authentication, hosted schema mutation, and deployment.

The single next action is to review and authorize the prepared credential migration and Vercel UI deployment from this branch.
