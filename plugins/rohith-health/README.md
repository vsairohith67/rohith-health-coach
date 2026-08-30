# Rohith Health private plugin

This local, private Codex plugin exposes only the seventeen read-only Rohith Health Coach MCP tools. It contains no personal records or credentials.

Prerequisites: extract the main application, install its pinned dependencies, and set `ROHITH_HEALTH_REPO` to that application directory when the plugin is installed elsewhere. Keep all production integration flags off until the owner completes the documented authorization tests.

Run `node tests/package-safety.test.mjs` and validate the plugin manifest before installation. This package is private and must not be published to a public directory.
