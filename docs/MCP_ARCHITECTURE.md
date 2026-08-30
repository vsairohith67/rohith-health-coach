# MCP architecture

`services/health-mcp` uses the official TypeScript SDK. A server factory registers the seventeen allowlisted tools and an optional widget resource. Tool execution delegates to the query service; it does not query Postgres directly.

Transports:

- stdio for local Codex/plugin use; protocol stdout is reserved for MCP messages.
- loopback Streamable HTTP for local integration tests, with protected-resource metadata and bearer rejection.
- remote deployment is not active. It requires HTTPS, OAuth 2.1/PKCE, exact metadata, private access, and the Secure MCP Tunnel or an equivalently reviewed private path.

The server binds `127.0.0.1` by default. `ENABLE_PUBLIC_MCP` remains false and public directory publication is prohibited.
