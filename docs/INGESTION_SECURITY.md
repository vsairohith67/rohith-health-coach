# Ingestion security

The Edge Function accepts only POST JSON over HTTPS, validates content type/size/schema, requires one bearer token and device ID, and resolves the credential through a service-only RPC. Credentials are hashed, scoped to `health:ingest`, expiring, revocable, and device-bound.

The service verifies the time window, maximum sample count, allowlisted metric/unit pairs, ordered timestamps, numeric bounds, and metadata limits. It calculates source hashes server-side, writes an ingestion event and samples transactionally where supported, and treats duplicate source hashes/idempotency keys as normal repeat delivery. Errors use stable codes without echoing payloads.

Production requirements not proven locally: distributed rate limiting, Edge Function/JWT configuration, CORS allowlist, hosted log redaction, token bootstrap UI, scheduled cleanup, and replay/revocation tests against the actual project. Never expose the service role or token pepper to the browser/Shortcut.
