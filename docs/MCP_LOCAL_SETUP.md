# Local MCP setup

Install pinned dependencies, keep Demo Mode enabled, and run:

```powershell
$env:ENABLE_HEALTH_MCP = "true"
pnpm.cmd exec tsx services/health-mcp/src/transports/stdio.ts
```

For loopback HTTP development, use the project transport entry point with host `127.0.0.1` and the documented test authorization context. Do not bind to `0.0.0.0`, forward the port, or place real health data in protocol captures.

Run `pnpm.cmd test:mcp` before configuration. The tests initialize/list/call through the official SDK, spawn stdio, verify loopback metadata/401 behavior, and exercise OAuth primitives.
