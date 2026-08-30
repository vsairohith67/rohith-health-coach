# Disable and revoke

Run `pnpm.cmd disable:all-ai -- -EnvFile <private-env-file>` or manually set every `ENABLE_*AI*`, MCP, ChatGPT, agent-runtime, widget, raw-health/notes/GPS-to-AI, and future-write flag to false. Restart affected services.

Then stop the local/remote MCP transport and tunnel, disconnect the ChatGPT app, unload the Codex plugin, revoke OAuth/agent/provider/device credentials, and confirm a former token/call fails. Remove provider secrets from host managers only after identifying dependencies; rotate rather than merely deleting a compromised value.

The script modifies only an explicitly resolved file inside the repository and does not print values. Production host settings require equivalent dashboard/CLI changes and a read-back of flag names/statuses without secrets.
