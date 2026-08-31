# RC7 final security report

Verified: 2026-08-31

## Passed gates

- Hosted GitHub CI and Vercel Git deployment.
- Public signup disabled and 6/6 negative probes passed.
- Exact Auth URL allowlist with no wildcard.
- One confirmed passwordless owner identity.
- Private Production authentication and zero-data shell.
- Hosted RLS: 179/179.
- Private FIT Storage: 21/21.
- Hosted ingestion: 26/26.
- RC7 application/API E2E harness: 14/14.
- Required 24-case hosted E2E: 24/24.
- Source arbitration: 12/12 unit cases plus hosted critical-value readback.
- Private export and signed expiration.
- Selective deletion and complete synthetic cleanup.
- Client bundle secret scan and service-worker private-cache scan.
- Supabase/Vercel log scan found no tested raw-health, bearer, or device-token markers.

## Live advisor review

The authenticated `SECURITY DEFINER` warning for `request_account_deletion(text)` is intentional and audited: caller ownership derives only from `auth.uid()`, anonymous is denied, scope is allowlisted, `search_path` is empty, objects are schema-qualified, and no dynamic SQL exists.

Leaked-password protection is a Pro-plan feature and remains disabled on Free. The owner path is passwordless and temporary password identities were synthetic and deleted. Performance Advisor INFO notices for unindexed foreign keys/unused indexes were recorded and not changed without query evidence.

## Hard blocker

GitHub visibility remains **PUBLIC** under the user's explicit temporary override. This prevents a real-data readiness verdict even though the hosted synthetic gates pass.

## Verdict

**NOT SAFE FOR REAL DATA**

Real health data, phone automation, AI, MCP, ChatGPT, Codex, and Garmin cloud API remain disabled. No paid change was made and no GA promotion occurred.
