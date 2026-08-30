# Shortcut security

- Treat the device ingestion token like a password. It is scoped to one device and ingest only.
- Keep it inside a private Shortcut; never use a shared link, clipboard history, Note, notification, or debug output.
- Require HTTPS to the exact configured host; reject redirects to another origin.
- Send only allowlisted fields and a bounded window.
- The token must expire and be revocable/rotatable. The database stores a hash and hint only.
- Use idempotency keys and server rate limits to reduce replay impact.
- Never embed Supabase secret/service-role keys in Shortcuts.
- If the phone, Shortcut, token, or screenshots may be exposed: disable automation, revoke the token, inspect safe audit events, then issue a replacement.
