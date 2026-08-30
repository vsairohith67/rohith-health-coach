# Real-data readiness

- Core classification: **READY FOR CONTROLLED LOCAL TESTING**.
- Pilot status: **NOT STARTED**.
- Automation status: **DISABLED**.

Software/local gates pass, but real records must not be used until a dedicated Supabase project is confirmed and its migrations, invite-only Auth, two-user/anonymous RLS, private Storage, ingestion token lifecycle/rate/idempotency, logs, retention, deletion/export, backup/restore, and advisors pass with synthetic data. A Vercel Preview/Production target, private FIT worker, official decoder decision, iPhone Shortcut, physical-device automation, consent, and incident/rollback drill are also pending.

The first real-data pilot must be one owner, one bounded day/source, no external AI/MCP, verified provenance/missingness, export/delete proof, and immediate rollback/revoke ability. See `PILOT_CHECKLIST.md`.
