# RC5 Vercel Production report

Verified: 2026-08-30 (Asia/Calcutta)

## Gate result

Status: **BLOCKED — no compliant private Production shell approved**.

The mandatory Supabase Auth gate is not green because hosted read-back still reports public email signup enabled. Accordingly, no real-data-capable or Supabase-connected Vercel Production deployment was intentionally promoted, and the Stage 14 hosted Production E2E flow was not run.

## First deployment target discrepancy

The first connected deployment request was submitted as a Preview, but authoritative Vercel read-back classified deployment `dpl_HgMUDQi1Cr43A2TWs3LXqQj752y9` as `target: production` and assigned the aliases:

- `https://rohith-health-coach.vercel.app`
- `https://rohith-health-coach-vsairohith67-1182s-projects.vercel.app`

This discrepancy is retained as audit evidence. No force operation, billing change, or additional Production promotion was attempted.

The resulting target is a **synthetic Demo shell only**, not the required private Production shell:

- version `1.0.0-rc5`
- `DEMO_MODE=true`
- deterministic mode
- health endpoint reports `syntheticOnly: true`
- visible Demo-data and synthetic labels
- noindex/nofollow
- no production Supabase URL or key
- no service-role key, database password, ingestion pepper, device token, OAuth secret, real owner account, real health record, real FIT file, or AI key
- all AI, MCP, ChatGPT, Codex, Garmin cloud, and phone automation integrations disabled

Because this Demo shell is public and does not require health authentication, it is not accepted as Stage 13 completion and must never receive real data.

## Bundle and secret posture

The same 48-file RC5 source set used for Preview was built successfully. The release source and extracted archive are subject to the RC5 secret/private-data scans recorded in `RC5_RELEASE_REPORT.md`. No production secret was supplied to either Vercel deployment.

## Cost

The Hobby/free team was used. No paid change was made; expected cost remains `$0` within plan limits.

## Verdict

Private Production shell: **NOT CREATED / BLOCKED BY HOSTED AUTH**.

Real health information remains prohibited.
