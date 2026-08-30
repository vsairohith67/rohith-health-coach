# Codex MCP setup

The private plugin is in `plugins/rohith-health`. It contains a manifest, `.mcp.json`, launcher, one health skill, result schema, tests, README, and notice. It contains no data or credentials.

1. Extract the full app and run the verification suite.
2. Extract the private plugin archive separately.
3. Set `ROHITH_HEALTH_REPO` to the full app directory if the plugin is installed elsewhere.
4. Keep `ENABLE_HEALTH_MCP=false` until ready; then enable only the local stdio connection.
5. Install/load the plugin through Codex’s private local plugin workflow and inspect the seventeen tools.
6. Test capabilities/freshness with Demo Mode, then one narrow summary.
7. Remove/disable the plugin and confirm no server remains.

The launcher uses `pnpm exec tsx`, no shell, and fails with a configuration error if source is absent. RC4 package validation passed; installation into this live Codex host was deliberately left as the one owner-visible connection action after infrastructure readiness.
