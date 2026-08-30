# RC5 hosted database report

Verified: 2026-08-30 against Supabase project `wmzrkkqcfvuhjpduplod` in `ap-south-1`.

## Migration result

The repository migrations were applied in order through the migration API:

1. `20260830093822_rc4_core`
2. `20260830093825_rc4_secure_service_functions`
3. `20260830093829_rc4_harden_table_privileges`
4. `20260830095516_rc5_harden_owner_relationships`

The RC5 migration closes two hosted red-team findings by binding device/provider relationships to the same user and requiring both path ownership and recorded object ownership in private Storage policies. It also removes direct browser execution of the private ingestion-credential resolver.

## Reproducibility

- A clean local Supabase database reset applied all four migrations successfully.
- pgTAP suites: 2 files, 47 tests, 47 passed, 0 failed.
- Hosted rollback-only authorization matrix: 179 passed, 0 failed.
- Hosted migration history was read back after application.

## Schema verification

- Exposed owner-scoped tables: 23, all with RLS and FORCE RLS.
- Authenticated owner-policy coverage: 23 of 23 tables.
- Public policies: 24 owner/knowledge policies before the RC5 Storage-specific policies.
- Private FIT Storage policies: 3, all bound to authenticated path and `owner_id`.
- Indexes verified before RC5 hardening: 59; RC5 added four relationship/cleanup indexes and one required parent uniqueness constraint.
- Constraints verified before RC5 hardening: 114; RC5 replaced the single-column device/provider foreign key with an owner-bound composite foreign key.
- Update triggers: 10.
- Auth foreign-key dependencies: 23.
- Public views exposing health tables: 0.
- Private schemas remain unavailable to `anon` and `authenticated`.

## Data state

The normal 90-day Demo Mode dataset was not seeded. Temporary hosted fixtures used only synthetic identities and synthetic values. Transactional fixtures were rolled back; API fixtures were explicitly deleted. Final read-back found:

- synthetic Auth users: 0
- profiles: 0
- raw health samples: 0
- export jobs: 0
- FIT Storage objects: 0

No real health information or real FIT file was connected.

## Advisors

The security advisor reports one intentional warning: signed-in users may execute `request_account_deletion(text)`. The function is the deliberately exposed private-account deletion request RPC. It pins an empty `search_path`, reads ownership from `auth.uid()`, allowlists the scope, and was exercised for valid ownership, anonymous denial, and injected-scope rejection in the hosted matrix.

Performance advisor findings are informational missing/unused-index notices on an empty new database. They do not weaken RLS or authorization. No index was removed based on zero-use statistics from an empty project.

Result: database migrations and hosted database security checks pass. Auth configuration remains a separate gate.
