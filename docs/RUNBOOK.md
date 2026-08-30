# Local and deployment runbook

## Daily source check

Run format, lint, typecheck, tests, build, E2E, secret scan, Python checks, and local database tests. Review only safe summaries and request IDs.

## Incident stop

1. Run `pnpm.cmd disable:all-ai` against the intended private environment file.
2. Disable MCP/ChatGPT connections and ingestion automation.
3. Revoke affected device/agent/OAuth credentials and sessions.
4. Preserve privacy-safe logs; do not copy health payloads into tickets/Notion.
5. If exposure is plausible, rotate server/provider secrets and follow `INCIDENT_RESPONSE.md`.

## Recovery

Restore infrastructure/config first, run migrations and synthetic RLS/Storage tests, restore encrypted data only to an isolated project, reconcile object/database references, then reopen one integration at a time. Do not declare recovery from a health endpoint alone.

## Release

Generate archives with `pnpm.cmd release:all`; verify them with `pnpm.cmd verify:release`; record SHA-256 in the final checksums and manifest. GA requires every hosted/real connection gate, not merely a passing ZIP.
