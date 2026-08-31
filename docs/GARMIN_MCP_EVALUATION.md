# Garmin MCP evaluation

## Decision

**CANDIDATE FOR RC9 LOCAL READ-ONLY EXPERIMENT**

This is a research decision only. The reviewed revision is not approved for Production, ChatGPT exposure, a network listener, or Garmin authentication yet. RC9 may proceed only after the dependency and Windows-readiness prerequisites below are resolved and re-tested.

## Reviewed source

- Repository: [Taxuspt/garmin_mcp](https://github.com/Taxuspt/garmin_mcp)
- Branch: `main`
- Exact commit: `3610be6feed93088d85b0f35aba9d7d07c2505a7`
- Commit date: 2026-08-04
- Release observed: `0.1.0`, published 2026-05-08
- License: MIT
- Repository state at review: public, active, not archived; recent CI and weekly security-workflow runs were green
- Source size: 75 tracked files and 138 registered MCP tool decorators at this commit

No Garmin credentials were supplied, no OAuth flow was started, and no Garmin account was accessed.

## Architecture and dependencies

The server is Python and uses the unofficial `python-garminconnect` client. Direct runtime dependencies in the locked review were:

- `garminconnect==0.3.2`
- `python-dotenv==1.2.2`
- `requests==2.33.0`
- `mcp>=1.28.1,<2`
- `fitparse>=1.2.0`

Python 3.10 or newer is required. `uv.lock` exists and the reviewed environment resolved 54 packages. Docker support exists, but the image runs as root, copies `uv` from an unpinned `latest` image, persists the token directory in a volume, and permits credentials through environment variables. Docker is therefore not the recommended RC9 path.

## Authentication and token storage

- The preferred flow is a separate interactive `garmin-mcp-auth` run, followed by token-based startup.
- The MCP process can also receive email/password values or file paths, but RC9 must not put either credential in an MCP client configuration.
- OAuth tokens are described by the project as lasting approximately six months and granting broad Garmin-account access.
- The default token directory is `~/.garminconnect`.
- Authentication also writes a second base64 copy at `~/.garminconnect_base64`. Base64 is encoding, not encryption, so this unnecessarily doubles credential material.
- The project calls `chmod` for owner-only POSIX permissions after writes. That does not provide equivalent ACL assurance on Windows.
- The pinned `garminconnect==0.3.2` is affected by [GHSA-wjhr-76vg-2hvc](https://github.com/advisories/GHSA-wjhr-76vg-2hvc), which concerns insecure OAuth token-store permissions and is fixed in 0.3.5.

RC9 must use a dedicated token directory with verified Windows ACLs, prevent creation of the base64 duplicate, and upgrade/test the Garmin client before authentication.

## Transports

- `stdio` is the default and is the only transport acceptable for RC9.
- Streamable HTTP and SSE are optional.
- Network transports bind to `127.0.0.1` by default, but the source explicitly states that they have no authentication.
- Binding HTTP to `0.0.0.0` would expose every registered Garmin tool to the reachable network unless a separately reviewed authenticating proxy were added.

RC9 must set `GARMIN_MCP_TRANSPORT=stdio` and must not create a tunnel or listener.

## Tool exposure and mutations

With no filter configured, all 138 tools register. The tool set includes reads but also material mutations and file writes, including activity edits, manual activity creation, body-composition and hydration writes, gear changes, nutrition create/update/delete operations, course upload/delete, workout create/upload/delete/schedule operations, and FIT/GPX/TCX/CSV downloads.

The source implements case-insensitive `GARMIN_ENABLED_TOOLS` and `GARMIN_DISABLED_TOOLS`. An allowlist takes precedence and unknown names produce a warning. This mechanism is adequate for an experiment only if an exact allowlist is mandatory and startup evidence confirms that no other tools registered.

### Minimum RC9 allowlist

```text
get_sleep_summary,
get_stress_summary,
get_body_battery,
get_hrv_data,
get_morning_training_readiness,
get_training_status,
get_activities_by_date
```

Use `get_hrv_data` with its default `return_timeseries=false`. Bound `get_body_battery` and `get_activities_by_date` to the smallest necessary date window and page size. Do not add activity-detail, profile, download, scheduling, gear, workout-management, course, nutrition, or any mutation tool without a separate review.

## Tests and maintenance evidence

- The source contains 29 test files and 494 collected unit/integration tests. E2E tests require real Garmin credentials and are skipped by default; none were run here.
- Locked dependency installation completed successfully on Windows with Python 3.11.16.
- Excluding the startup test that closes pytest's captured stdout on Windows: **488 passed, 5 failed**.
- The five failures expose Windows assumptions: one mixed path-separator assertion and four POSIX-mode assertions that observe Windows modes of `777`/`666`, not the expected `700`/`600`.
- The startup test's Windows stdout replacement closes pytest's capture stream and causes a cascade of teardown errors when included.
- Upstream CI runs on Ubuntu only, across Python 3.10-3.13; it does not provide a Windows job.
- The workflow named `Security Checks` does not run a dependency vulnerability scanner; its own source says one may be added.
- A local `pip-audit` of the locked environment found three advisories: `garminconnect 0.3.2`, `click 8.1.8`, and `h11 0.14.0`. The h11 finding is [GHSA-vqfr-h8mv-ghfj](https://github.com/advisories/GHSA-vqfr-h8mv-ghfj). All three must be upgraded or otherwise eliminated and the lock/test evidence regenerated before authentication.

## RC9 admission conditions

All conditions are mandatory:

1. Fork or otherwise pin the exact reviewed source revision.
2. Upgrade the three audited vulnerable dependencies to patched compatible versions and regenerate the lockfile.
3. Make the full selected Windows test suite green, including startup/capture behavior.
4. Use local `stdio` only.
5. Configure the exact seven-tool allowlist and verify the advertised tool list at startup.
6. Use an isolated local account/token directory with verified Windows ACLs.
7. Prevent the base64 duplicate token file.
8. Authenticate interactively outside Codex/Desktop configuration; never store Garmin email/password in configuration, Git, logs, or reports.
9. Keep data local and read-only; do not connect it to Rohith Health Coach Production, AI, ChatGPT, a tunnel, or an always-on host.
10. Define token revocation and complete local cleanup before the experiment begins.

Until all ten conditions pass, Garmin MCP remains disabled.
