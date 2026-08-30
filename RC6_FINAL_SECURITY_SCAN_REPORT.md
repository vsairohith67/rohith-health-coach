# RC6 final security-scan report

Scanned: 2026-08-30

## Source tree

- Evidence-inclusive credential-signature scan: **PASS**, 335 text files, zero findings. The immutable archive candidate itself was scanned at 332 text files before the excluded checksum/manifest/report evidence was added.
- Private-data filename scan: **PASS**, 340 source files considered, zero forbidden files.
- Forbidden types checked include non-example environment files, FIT/GPX/TCX, private keys/certificates, logs, caches, build output, Vercel state, and linked Supabase state.
- Email-shaped content appeared in five files only: one private-login unit test, three pgTAP security fixtures, and the RC5 hosted RLS matrix. All addresses are clearly synthetic/test-only; no owner address is present.
- Documentation contains prohibition/limitation text for GPS, notes, medication, raw samples, and FIT, not real records.
- No screenshots are included in the source/archive candidate.

## Production build

- `apps/web/.next` credential-signature scan: **PASS**, 858 text files, zero findings.
- Static client JS/CSS/source-map marker scan: **PASS**, zero files containing secret-key, service-role, database-password, ingestion-pepper, Vercel-token, or token-assignment markers.
- Server bundle matches for the literal property name `refresh_token` are dependency identifiers, not token values.
- Built Today HTML contains the private empty state, not Demo Mode, `4,861`, or `13,009`.
- Source maps were included in the marker scan where generated.

## Artifacts and hosted configuration

- Playwright/test-results scan: **PASS**, two text artifacts, zero credential signatures.
- No `.vercel` directory or CLI token exists in the release source.
- The connected Vercel project was read-only during RC6; no environment secret was added or exposed.
- Exact hosted SQL readback remains zero Auth users/sessions/refresh tokens, application rows, private credentials, and Storage objects.

## Verdict

Final source/build scan: **PASS**.

The RC6 ZIP contains 324 files with zero forbidden entries. Its clean pre-install extraction passed a 318-text-file credential scan and zero-forbidden-private-file scan; the extracted Production build passed a 644-text-file scan with zero client secret markers.
