# Deployment

Deployment is staged and fail-closed:

1. Verify source, locks, tests, build, secret scan, and archives.
2. Create/confirm one private Supabase project; apply/test schema, Auth, Storage, and ingestion with synthetic users.
3. Create a Vercel preview for the exact reviewed commit in Demo Mode, then wire only publishable browser configuration.
4. Deploy the FIT worker privately only after an approved host and official decoder decision.
5. Run hosted synthetic end-to-end, security, accessibility, PWA, rollback, and monitoring checks.
6. Build/test the iPhone Shortcut with synthetic data.
7. Connect Codex locally, then a private ChatGPT app through secure authenticated MCP.
8. Conduct the first real-data pilot only after consent and retention confirmation.

Do not expose public MCP, external AI, public signup, raw notes/GPS, or medication data. RC4 completed source/local gates only.
