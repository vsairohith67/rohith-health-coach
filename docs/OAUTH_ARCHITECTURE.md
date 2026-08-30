# OAuth architecture

The remote MCP authorization design follows OAuth 2.1 security practices:

- Authorization Code with PKCE S256 only; no implicit or password grants.
- Cryptographically random state, verifier, authorization code, access token, and refresh token.
- Exact pre-registered redirect URIs; no wildcard/open redirect.
- Issuer and audience validation; signed token/JWKS verification by the resource server.
- Short-lived access tokens, rotated refresh tokens, revocation and session invalidation.
- Least scopes matching health query categories; no write scope in RC4.
- Protected-resource and authorization-server metadata served over HTTPS.
- Token/client secrets never in URLs, browser storage, logs, reports, Notion, or plugin ZIP.

The repository tests state/PKCE/redirect/issuer/audience/scope/expiry/revocation primitives. It does not claim a production authorization server or dynamic client-registration conformance without the actual provider test.
