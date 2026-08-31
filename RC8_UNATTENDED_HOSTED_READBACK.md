# RC8 unattended hosted readback

Verified read-only: 2026-08-31

## Decision

- GitHub readback: **PASS**.
- Supabase project/database readback: **PASS**.
- Supabase Auth policy readback: **PASS**.
- Vercel deployment readback: **PASS**.
- Hosted mutation performed: **none**.
- Additional authentication requested: **none**.

## GitHub

- Repository: `vsairohith67/rohith-health-coach`.
- Visibility: **PUBLIC** under the owner's documented temporary exception.
- Default branch: `main`.
- Current `main` SHA: `3c32bdfb773ea23601eccad8b2f4af4646b3ec4c`.
- Latest `main` CI: run `33354492718`, completed **success** at the exact `main` SHA.
- Workflow: `ci`.
- CI URL: `https://github.com/vsairohith67/rohith-health-coach/actions/runs/33354492718`.

## Supabase

- Organization: `fqskwypboimofbiwfrat` (`Supabase test Organisation`).
- Plan: **Free**.
- Project: `rohith-health-coach-prod` (`wmzrkkqcfvuhjpduplod`).
- Region: `ap-south-1`.
- Project status: `ACTIVE_HEALTHY`.
- Postgres: 17.6.1.
- Applied migrations: 6; the latest is `20260831031630_rc7_private_exports`.
- Edge Function: `ingest-health`, version 6, `ACTIVE`.
- Function-level JWT verification remains off intentionally because this endpoint authenticates scoped device credentials in its own handler. No setting was changed during this readback.

Aggregate database readback:

- Auth users: 1.
- Confirmed users: 1.
- Email identities: 1.
- Active sessions: 0.
- Refresh tokens: 0.
- Profiles, provider connections, devices, ingestion credentials, ingestion events, raw samples, sleep rows, activities, daily metrics, check-ins, coach reports, exports, FIT files, and Storage objects: all 0.
- Public tables without RLS: 0.

Authentication settings were read from the already-authenticated dashboard session without changing them:

- New-user signup: **off**.
- Anonymous sign-in: **off**.
- Email confirmation: **on**.
- Email provider: enabled.
- Phone, social, Web3, and custom providers: disabled.
- Site URL: `https://rohith-health-coach.vercel.app`.
- Redirect allowlist: exactly four explicit URLs: Production callback/confirm and `127.0.0.1:3000` callback/confirm. No wildcard was present.

Security Advisor still reports two known warnings: the intentional authenticated `request_account_deletion(text)` SECURITY DEFINER RPC and Free-plan leaked-password protection being unavailable/disabled. The first was previously audited as owner-derived, scope-allowlisted, schema-qualified, and free of dynamic SQL. The passwordless private owner flow does not justify a paid-plan change.

Performance Advisor reports information-only unindexed-foreign-key and unused-index notices. No performance mutation was made during the unattended security readback.

## Vercel

- Team: `team_LO8H9E9FSHIgcfz1I0yTc4is`.
- Project: `rohith-health-coach` (`prj_l23ScHanPfBEMXz3TjQ8w2KXIGN8`).
- Current Production deployment: `dpl_5icf6hskaC1sSnpwj2Cv5kNNAjDD`.
- State: `READY`.
- Source: Git `main` SHA `3c32bdfb773ea23601eccad8b2f4af4646b3ec4c`.
- Canonical Production URL: `https://rohith-health-coach.vercel.app`.
- Deployment source verification: verified Git commit.

The already-authenticated dashboard session exposed configuration names and targets only; values were not read or recorded. The visible Production-only configuration includes the ten default-off feature flags plus the browser-safe Supabase URL and publishable-key names. Preview and Development targets had no listed values. No server-secret variable name such as a Supabase secret key or ingestion pepper was present. This preserves Preview/Production separation.

The local Vercel CLI was logged out. No login flow was completed; the existing connector and dashboard session supplied the read-only evidence instead.

Anonymous Production probes passed:

- `GET /today`: HTTP 307 to `/sign-in`.
- `GET /api/health`: HTTP 401.
- Probe response bodies contained no access-token, refresh-token, device-token, Supabase-secret, or service-role marker.

## Boundary

No credentials were entered, no email link was opened, no Production ingestion credential was issued, no health data was read or written, no hosted setting was changed, and no paid service was enabled.
