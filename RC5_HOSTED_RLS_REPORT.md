# RC5 hosted RLS red-team report

Verified: 2026-08-30 against the actual hosted Supabase project `wmzrkkqcfvuhjpduplod`. Local results were not used as a substitute.

## Finding and repair

The first hosted probe found two authorization defects:

1. User A could associate an A-owned device with User B's provider connection.
2. User A could insert a Storage metadata row below A's path while claiming User B as `owner_id`.

The gate stopped. Migration `rc5_harden_owner_relationships` then added an owner-bound device/provider foreign key and required path plus recorded owner agreement in all FIT object policies. The same two hosted probes were rerun:

- forged provider relationship: denied with SQLSTATE `23503`
- forged Storage owner: denied with SQLSTATE `42501`

No failing fixture persisted because both probes ran in transactions that rolled back.

## Hosted matrix

Result: **179 passed, 0 failed**.

| Category                                             | Checks | Result |
| ---------------------------------------------------- | -----: | ------ |
| Test User A owner-scoped reads across 23 tables      |     23 | pass   |
| Test User B owner-scoped reads across 23 tables      |     23 | pass   |
| User A cross-user insert/update/delete attempts      |     21 | pass   |
| User B cross-user insert/update/delete attempts      |     21 | pass   |
| Derived health-table INSERT/UPDATE/DELETE privileges |     48 | pass   |
| Anonymous denial                                     |     13 | pass   |
| Private Storage database-policy checks               |     10 | pass   |
| SECURITY DEFINER and execute-permission audit        |     11 | pass   |
| RLS configuration and owner-relationship checks      |      5 | pass   |
| RPC ownership/scope checks                           |      3 | pass   |
| Public view audit                                    |      1 | pass   |

The tested resources include profiles, provider connections, devices, ingestion events, raw samples, daily metrics, sleep sessions/stages, activities/laps/records, check-ins, coach reports, FIT metadata/jobs, baselines, insights, audit events, exports, and deletion jobs.

## Mandatory attack classes

- Cross-user SELECT: denied for both users on every owner-scoped table.
- Cross-user UPDATE and DELETE: zero affected rows on all browser-writable owner tables.
- Forged-owner INSERT: denied on all browser-writable owner tables.
- Derived health INSERT/UPDATE/DELETE: no authenticated browser grants.
- Forged `provider_connection_id`: denied by owner-bound foreign key.
- Forged Storage `owner_id`: denied by RLS.
- Guessed Storage path: denied.
- Anonymous health read/write, device creation, export, private credentials, FIT job action, and private Storage: denied.
- Public views: none.
- Private schemas: no `anon` or `authenticated` usage.

## Function audit

All application SECURITY DEFINER functions pin an empty `search_path`. Browser roles cannot execute service credential, credential issue, credential mark-used, or FIT job claim functions. The sole authenticated RPC, `request_account_deletion`, derives ownership from `auth.uid()`, allowlists scope, rejects an injected scope, and writes only the caller's deletion job. No application SECURITY DEFINER body uses dynamic `EXECUTE`.

All synthetic rows and identities from this database matrix were rolled back. Final hosted counts confirm zero residual synthetic users, raw samples, exports, or Storage objects.

Result: hosted RLS gate passes after repair.
