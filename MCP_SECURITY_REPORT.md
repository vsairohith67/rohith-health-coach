# MCP security report

Local status: **stdio and loopback HTTP passed; remote exposure blocked**.

- Official Model Context Protocol SDK package is pinned.
- Seventeen explicitly named read-only tools map to bounded typed query operations.
- No write, generic query, arbitrary SQL/table, shell, file, browser, URL-fetch, raw-record, GPS, or private-note capability exists.
- Authorization subject comes from validated context; scopes, expiry, revocation, range, output size, timeouts, and rate limits are enforced.
- Tool responses are structured, evidence-linked, sanitized, and safe-logged.
- HTTP metadata/unauthorized behavior and stdio initialize/list/call were integration-tested on loopback.

MCP Inspector, real Codex registration, real ChatGPT connection, tunnel isolation/revocation, and hosted concurrency/rate-limit behavior remain unexecuted. The server must not be placed on a public unauthenticated interface.
