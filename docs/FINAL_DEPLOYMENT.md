# Final deployment sequence

RC4 software is packaged before operational activation. The exact promotion order is:

1. Create/confirm dedicated Supabase project and cost; hosted migrations, Auth, RLS, Storage, ingestion, advisors, cleanup, backup/restore using synthetic identities.
2. Commit/push a private repository; exact-head CI passes.
3. Vercel preview, synthetic hosted E2E/security/accessibility/PWA and rollback.
4. Private FIT worker with official decoder decision and adversarial corpus.
5. Production web promotion with monitoring and no external AI/MCP.
6. Synthetic iPhone Shortcut/automation pilot, then controlled first real-data pilot and deletion/export proof.
7. Codex local MCP/plugin connection.
8. Private ChatGPT app through authenticated Secure MCP Tunnel; widget and revocation tests.
9. Optional local model benchmark/evals and explicit consent.
10. GA review only when every report is verified and no P0/material P1 remains.

Current stopping point: step 1 needs the owner’s organization/cost confirmation; no production or GA artefact is created.
