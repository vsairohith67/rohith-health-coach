# Production privacy configuration

Before any real record:

- Invite-only Auth; short sessions appropriate to the owner; secure redirect allowlist.
- Explicit RLS/table grants and private FIT bucket verified in the hosted project.
- Raw sample and FIT retention scheduled; exports expire; deletion covers database, objects, and connected credentials.
- Preview and production secrets separated; service role/peppers only in server managers.
- Third-party analytics, public logs, email health content, external AI, notes/GPS/medication transfer, and public MCP disabled.
- Error logs redact bodies, query output, filenames, URLs/tokens, and metric values.
- Consent names each optional processor and can be withdrawn independently.
- Backup retention and deletion lag are stated to the user.

Record the final settings as booleans/statuses only. Never paste secret values into a report.
