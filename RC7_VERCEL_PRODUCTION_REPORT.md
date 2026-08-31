# RC7 Vercel Production report

Verified: 2026-08-31

## Resource

- Team: `team_LO8H9E9FSHIgcfz1I0yTc4is` (Hobby/free).
- Project: `rohith-health-coach` (`prj_l23ScHanPfBEMXz3TjQ8w2KXIGN8`).
- Git repository: `vsairohith67/rohith-health-coach`.
- Production branch: `main`.
- Production URL: `https://rohith-health-coach.vercel.app`.
- Source: Vercel Git integration, not a local upload.

## Production isolation

Fourteen Production-only configuration values were read back from Vercel. They set Demo Mode, AI providers, agent runtime, MCP, ChatGPT, Codex, Garmin cloud, and public signup Off while supplying only the exact site URL and browser-safe Supabase URL/publishable key.

No Supabase secret/service-role key, database password, ingestion pepper, device token, owner address, OAuth secret, or AI-provider key is configured in Vercel. Preview remains isolated from Production and was not converted into the private Production environment.

## Deployment and verification

The final RC7 Git deployment is `dpl_5icf6hskaC1sSnpwj2Cv5kNNAjDD`, `READY`, from exact `main` merge `3c32bdfb773ea23601eccad8b2f4af4646b3ec4c`. The authenticated `/api/health` readback reports `1.0.0-rc7`, `dataConnected=false`, and `syntheticOnly=false` (the private zero-data Production profile).

- Anonymous UI denial: 11/11.
- Anonymous private API denial: 2/2.
- Authenticated private pages: 10/10.
- Client bundle forbidden-secret markers: 0.
- Service-worker private-cache markers: 0.
- Paid changes: none.

Result: Production deployment gate **PASS**.
