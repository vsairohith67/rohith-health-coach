# Operations runbook

Daily/after-change: check deployment/runtime health, safe error counts, ingestion success/duplicate/reject rates without values, auth anomalies, Storage privacy, worker queue depth, and scheduled retention/deletion. Weekly: dependency/provider advisories and backup status. Quarterly/before migrations: isolated restore and revoke/incident drill.

Never log/request bodies, health values, notes, routes, filenames, bearer tokens, service keys, or signed URLs. Use request IDs and safe codes. Disable affected integration first during an incident; deterministic Demo/private functionality may remain if isolated.

Detailed local commands are in `docs/RUNBOOK.md`. Hosted command/IDs are recorded only after resources exist.
