# RC5 Supabase project report

Verified: 2026-08-30. This report intentionally excludes all credentials.

- Organization: `Supabase test Organisation` (`fqskwypboimofbiwfrat`), selected from the connected memberships.
- Organization plan: Free.
- Projects before creation: zero; duplicate-name check passed.
- Authoritative connector cost: `$0/month` for one project.
- Project: `rohith-health-coach-prod`.
- Project reference: `wmzrkkqcfvuhjpduplod`.
- Region: `ap-south-1` — South Asia (Mumbai), selected after checking the current supported-region list as the specific supported region nearest Hyderabad.
- Status after creation/read-back: `ACTIVE_HEALTHY`.
- Database: PostgreSQL 17, release channel GA (platform-managed patch version `17.6.1.166` at verification).
- Database credential: generated and retained by the platform's secure project mechanism; it was not printed, copied into the workspace, placed in Git, recorded in a report, sent to the browser, or included in an archive.
- Billing: no upgrade, trial, add-on, payment method, or billing-plan change.
- Data state at project creation: no application migrations and no health records; only platform bootstrap schemas.

The current Supabase changelog notes that new tables may not be automatically exposed to Data and GraphQL APIs. RC5 therefore treats grants, exposed schemas, and RLS as separate explicit verification gates.
