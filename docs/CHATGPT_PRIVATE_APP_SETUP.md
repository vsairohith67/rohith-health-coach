# Private ChatGPT app setup

Create only a private workspace app—never submit it to a public directory.

1. Complete hosted query/RLS/OAuth gates or use Demo Mode through the Secure MCP Tunnel.
2. Start the read-only MCP endpoint and verify protected-resource metadata.
3. In the private ChatGPT workspace, create a developer app/connector using the HTTPS MCP URL.
4. Configure OAuth metadata/scopes and complete the authorization flow.
5. Verify exactly seventeen read-only tools and the optional widget resource.
6. Test capabilities, freshness, one narrow summary, invalid range, missing scope, revocation, and disconnect.
7. Keep action language informational and confirm no raw notes/GPS/medication/result values appear in logs.

Do not use unauthenticated “no auth” mode for real data. No real app was created/connected in RC4; `plugin-state.json` records the prepared state truthfully.
