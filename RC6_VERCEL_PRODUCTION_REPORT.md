# RC6 Vercel Production report

Verified: 2026-08-30

## Inventory

- Team plan: Hobby/free.
- Project: `rohith-health-coach`.
- Exact intended Production URL: `https://rohith-health-coach.vercel.app`.
- Current latest Preview: ready and synthetic-only.
- Current Production target: the RC5 Demo-only target; it is not accepted as an authenticated health application.

## RC6 deployment decision

No RC6 Production deployment was created. The required hosted public-signup negative gate is 2/6 and `disable_signup=false`, so changing Production environment values or redeploying would violate the ordered stop gate.

The source defines the required Production profile:

- `DEMO_MODE=false`
- all AI, provider, MCP, ChatGPT, Codex, Garmin cloud, and public-signup flags false
- exact `NEXT_PUBLIC_SITE_URL`
- only Supabase URL and publishable key browser-visible
- no secret key, database password, ingestion token/pepper, owner address, or provider credential in client code

Preview remains isolated in deterministic Demo Mode. No Production Supabase secret, ingestion pepper, real account, real data, FIT file, phone token, or external AI key was added.

## Verdict

RC6 Production deployment: **NOT DEPLOYED**. Paid change: none.
