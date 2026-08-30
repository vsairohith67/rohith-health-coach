# RC5 Hosted Ingestion Report

- Date: 2026-08-30
- Project: `rohith-health-coach-prod` (`wmzrkkqcfvuhjpduplod`)
- Endpoint: Supabase Edge Function `ingest-health`
- Verified deployment: version 6, ACTIVE
- Bundle SHA-256: `390e7679706b79717f25204498eb19723c29f10741aa25c2d4d1ab31377ba06b`

## Security shape

- The function uses an opaque device bearer token plus the registered device ID.
- Supabase gateway JWT verification is intentionally disabled for this device-token route; the function performs its own credential lookup with a service-role client.
- Raw device tokens are never stored. A per-project secret pepper is held in Supabase Vault and credentials are stored as HMAC-SHA-256 digests.
- Revoked, expired, wrong-device, and wrong-user credentials fail closed.
- Request bodies are limited to 500,000 bytes, samples to 2,000, and history windows to 90 days.
- Responses use safe error codes, `Cache-Control: no-store`, JSON content type, and `X-Content-Type-Options: nosniff`.

## Hosted matrix

Result: **PASS — 26/26 checks**

The hosted test covered connection/method handling, missing and invalid credentials, revoked and expired credentials, registered-device and user binding, valid ingestion, duplicate request replay, duplicate sample handling, concurrent duplicate convergence, late sleep correction, partial day, ambiguous source conflict, Garmin/iPhone overlap, malformed timestamps, unsupported metric and unit, historical-window limit, payload-byte limit, sample-count limit, hardened response headers, and cleanup after a forced multi-row write failure.

## Database assertions before cleanup

- Synthetic Auth identities: 2.
- Credentials: User A 3; User B 1; all stored digest shapes were 64 lowercase hexadecimal characters.
- Completed ingestion events: 9/9.
- Canonical raw samples: 8.
- User B raw samples: 0.
- Duplicate/concurrent logical sample rows: 1.
- Late sleep correction: exactly 1 row, updated synthetic value 420.
- Forced rollback event rows: 0.
- Forced rollback sample rows: 0.
- Garmin/iPhone overlap: selected steps `4861`, decision `selected`, one `overlap_not_combined` conflict; `13009` was never produced.
- Ambiguous equal-priority totals: steps `NULL`, decision `conflict`.
- Active valid credential use timestamp: recorded.

## Logging review

The current hosted Edge Function log response (43,173 characters at review time) contained no `4861`, `8148`, `numeric_value`, `source_record_id`, authorization header, or bearer-token marker. Matches for the character sequence `420` were inspected and occurred only inside request timestamps, not health values. Function code logs only request ID and inserted/updated/duplicate counts.

## Cleanup

After the matrix, the two synthetic Auth identities were deleted. Cascade/read-back verification returned zero test users, devices, credentials, events, raw samples, and daily metrics. No real health information was used.

## Verdict

Hosted ingestion security and source-arbitration ingestion checks: **PASS**.

This result does not clear the separate hosted Auth configuration gate. Public signup remains enabled in the hosted Auth configuration and must be disabled before production deployment or any real-data pilot.
