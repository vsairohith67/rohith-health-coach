# Cloudflare optional layer

Cloudflare is not required or enabled. A future reviewed release may use it for private tunnel/access controls, WAF/rate limiting, or DNS already owned by the user. It must not become a second authoritative auth/data layer, terminate a public unauthenticated MCP endpoint, cache private health responses, or introduce analytics by default.

If adopted, document account ownership/cost, exact data paths, TLS, Access policies, cache bypass, log redaction, rollback, and deletion. Re-run threat modelling and hosted security tests.
