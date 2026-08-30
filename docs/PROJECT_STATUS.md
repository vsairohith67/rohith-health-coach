# Project status

- Version: `1.0.0-rc5`
- Mode: private, synthetic-only; production integrations default-off
- GitHub: RC4 PR merged to `main`; exact hosted Python and JavaScript CI passed
- Supabase: free Mumbai project created; five migrations applied; hosted RLS, Storage, and ingestion matrices passed
- Source arbitration: Garmin/iPhone overlap and ambiguity tests passed without unsafe summation
- Vercel: synthetic Preview passed; an initial Preview request was classified by Vercel as a Demo-only Production target and is not accepted as the private Production shell
- Hosted Auth: blocked because public email signup is still enabled
- Hosted Production/E2E: not run past the Auth stop gate
- Real-data pilot: not started
- Phone automation, AI, MCP, ChatGPT, Codex, Garmin cloud API: disabled
- FIT cloud worker: disabled; local boundary only
- GA: not promoted

Core hosted platform: **NOT SAFE FOR REAL DATA**.

Next action: disable public signup and read back the exact callback, recovery, session-expiry, and cookie settings in the Supabase dashboard.

This status contains no health records, credentials, tokens, signed URLs, FIT data, or personal medical information.
