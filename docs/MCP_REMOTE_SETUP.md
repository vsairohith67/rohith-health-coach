# Remote MCP setup

Remote MCP is prepared but disabled. Prerequisites:

1. A private hosted query service with proven Supabase RLS and least grants.
2. An OAuth 2.1 authorization server/client registration with PKCE S256, exact redirects, issuer/audience, scopes, rotation, revocation, and protected-resource metadata.
3. HTTPS and a private network/tunnel policy; never expose unauthenticated public HTTP.
4. Rate, concurrency, range/output caps, safe audit logs, monitoring, incident revoke, and rollback.
5. Synthetic protocol/tool/authorization tests from the actual ChatGPT workspace.

Prefer the OpenAI Secure MCP Tunnel for local private development. `ENABLE_PUBLIC_MCP` must remain false. A tunnel URL alone is not authorization.
