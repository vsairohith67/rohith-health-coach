# Testing

## Commands

```powershell
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd test:evals
pnpm.cmd build
pnpm.cmd test:e2e
pnpm.cmd verify:secrets
pnpm.cmd fit:lint
pnpm.cmd fit:test
pnpm.cmd dlx supabase@2.116.0 db reset --local --yes
pnpm.cmd dlx supabase@2.116.0 test db
pnpm.cmd dlx supabase@2.116.0 db lint --local
```

Unit tests cover seeded data, missingness, robust analytics, coaching, query scopes/ranges, AI safety, MCP registry/protocol/transports, OAuth primitives, widget schemas, and 220 fixed synthetic agent cases. Playwright covers desktop and mobile user flows, serious/critical Axe findings, responsive overflow, labels, and PWA privacy caching. Python tests cover FIT authentication, framing/CRC/hash, spoof rejection, and fail-closed decoding. pgTAP runs against a clean local Supabase stack with two synthetic users, anonymous access, grants, RPCs, and private Storage.

Hosted, physical-iPhone, real-data, screen-reader, real OAuth provider, private ChatGPT, and Codex installation tests are separate gates and are not implied by local results.
