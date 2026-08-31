# Rohith Health Coach

Rohith Health Coach is a private, evidence-led personal health PWA. The RC8.1 source combines deterministic aggregation/coaching, passwordless private Auth, an authenticated hosted Production shell, hosted synthetic security evidence, fail-closed source arbitration, and optional AI/MCP surfaces that remain disabled.

**Release status:** RC8.1 contains the reviewed owner device-credential migration and UI. Current hosted and pilot status belongs in the RC8.1 deployment reports rather than this public source overview. The real-data pilot must not start until CI, hosted migration, hosted synthetic lifecycle, Production deployment, and owner handoff gates pass.

## What works now

- A polished responsive Demo Mode built from a fixed 90-day synthetic profile.
- Missing/partial/conflicting data semantics, robust baselines, bounded trends, and deterministic coaching.
- Reproducible Supabase migrations, private Storage policies, HMAC-hashed ingestion credentials, 91 local database assertions, 179 hosted RLS checks, 21 hosted Storage checks, and 26 hosted ingestion checks.
- Garmin-first source arbitration that preserves alternatives, rejects ambiguous totals, and deduplicates overlapping Apple Health/FIT workouts.
- A fail-closed FastAPI FIT boundary. Validation works; full decode requires an owner-installed official Garmin FIT SDK adapter.
- Eighteen query operations, seventeen read-only MCP tools, OAuth 2.1/PKCE primitives, and a constrained widget.
- A local-only OpenAI-compatible narrative adapter. External AI providers remain disabled.

## Start locally on Windows

Prerequisites: Node.js 22+, pnpm 10.17.1, and optionally Docker Desktop, Supabase CLI through `pnpm dlx`, and `uv`.

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd dev
```

Open `http://127.0.0.1:3000`. Demo Mode needs no credentials and is visibly labelled as synthetic.

Run the complete local verification:

```powershell
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd test:evals
pnpm.cmd build
pnpm.cmd test:e2e
pnpm.cmd verify:secrets
pnpm.cmd verify:private-data
pnpm.cmd fit:lint
pnpm.cmd fit:test
```

For database tests, start the local stack, reset it, then run `pnpm.cmd db:test` and `pnpm.cmd db:lint`. See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Privacy defaults

All AI, MCP, ChatGPT, public signup, Garmin Cloud API, raw-health-to-AI, notes-to-AI, GPS-to-AI, and medication-data flags are false in `.env.example`. Deterministic data remains authoritative even when a narrative provider is later enabled. No credentials, personal records, FIT files, or model weights are included in release archives.

## Repository map

- `apps/web` — Next.js PWA and structured Ask experience.
- `packages` — domain, analytics, coaching, query, contracts, safety, and fixed evaluations.
- `services/health-mcp` — stdio and loopback HTTP MCP transports.
- `services/health-ai-gateway` — deterministic and local-only narrative providers.
- `services/fit-parser` — authenticated FastAPI FIT validator/decoder boundary.
- `supabase` — schema, service RPCs, ingestion function, private Storage, and pgTAP tests.
- `plugins/rohith-health` — private Codex plugin package.
- `docs` — setup, safety, deployment, and owner handoff.

Begin with [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/PRIVACY.md](docs/PRIVACY.md), and [FINAL_REAL_DATA_READINESS.md](FINAL_REAL_DATA_READINESS.md). Operational activation is intentionally separate from software clearance. See [RC8_DEVICE_TOKEN_READINESS_REPORT.md](RC8_DEVICE_TOKEN_READINESS_REPORT.md) for the current owner-credential deployment gate.
