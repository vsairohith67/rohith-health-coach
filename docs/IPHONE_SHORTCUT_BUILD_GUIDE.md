# iPhone Shortcut build guide

> RC8 note: `RC8_IPHONE_SHORTCUT_READY_GUIDE.md` is the authoritative manual
> pilot guide. It matches the deployed snake_case `1.0` envelope. The concise
> outline below is retained for architecture context only.

Create a new private Shortcut named **Send Health Summary to Rohith Health Coach**.

1. Add a Dictionary for `schema_version` `1.0`, export UUID, export timestamp, timezone, bounded window, device object, and samples.
2. For each allowlisted Health type, use “Find Health Samples” for the window, limit/order results, and map fields listed in `SHORTCUT_DATA_MAPPING.md`.
3. Build a stable idempotency key from device, window, and schema version; do not include the bearer token.
4. Use “Get Contents of URL”: POST, JSON body, `Authorization`, `x-device-id`, `x-idempotency-key`, and `x-request-id` headers to the exact HTTPS endpoint.
5. Parse only status, safe error code, inserted/duplicate/rejected counts, and request ID.
6. Add explicit branches for success, unauthorized, rate limited, invalid schema, and offline.
7. Delete all Quick Look/log actions before the private pilot.

Do not share an iCloud Shortcut that contains a token. Screenshots used for support must redact URLs, identifiers, and values.
