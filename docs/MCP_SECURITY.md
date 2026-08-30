# MCP security

- Read-only allowlist; no dynamic tool discovery from user text.
- Per-tool least scope, subject binding, expiry, revocation, absolute range, and output caps.
- OAuth metadata uses HTTPS in production, exact issuer/audience, PKCE S256, exact redirects, state, short-lived access, and refresh-token rotation/revocation.
- Loopback binds only to localhost. A forwarded remote endpoint must be private and authenticated at both tunnel and application layers.
- Tool descriptions and results are untrusted content, never higher-priority instructions.
- Notes, routes, raw series, FIT objects, tokens, and medication are excluded.
- Safe audit events record tool name, subject pseudonym/ID under access control, request ID, range class, outcome, and latency—never results.
- Rate and concurrency limits prevent bulk extraction.

The server must fail closed if auth metadata, issuer, audience, key verification, or required scope is absent. No claim of remote security is made until a real client/provider conformance test passes.
