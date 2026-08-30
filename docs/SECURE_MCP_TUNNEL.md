# Secure MCP Tunnel

The Secure MCP Tunnel is the preferred development bridge from a private ChatGPT workspace to the owner’s local MCP server. Install and authenticate the official tunnel separately, point it at the loopback MCP endpoint, and configure the private app with the generated HTTPS URL plus the required OAuth/protected-resource metadata.

Before connection: use Demo Mode, keep the local server on loopback, verify tool list/scopes, disable public MCP, and ensure protocol/log output contains no health values. After connection: call capabilities/freshness first, one narrow summary tool next, then revoke/stop the tunnel and confirm access fails.

Do not publish the tunnel URL, treat it as permanent hosting, rely on URL secrecy, or connect a public app. The tunnel/client step was not executed in RC4 because the real ChatGPT workspace interaction remains an owner action.
