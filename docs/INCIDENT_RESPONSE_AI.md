# AI and MCP incident response

1. Disable AI narrative, local/external providers, agent runtime, MCP, ChatGPT app/widget, and future writes using the environment flags.
2. Stop tunnels/servers and remove the private app/plugin connection.
3. Revoke OAuth sessions/refresh tokens, agent tokens, provider keys, and device credentials implicated.
4. Preserve privacy-safe request IDs, timestamps, tool/provider names, outcomes, and configuration versions—never prompts/results containing values.
5. Determine whether data crossed the local boundary or another user was accessible; follow the main incident process and applicable notification/legal review.
6. Patch, add a fixed regression/red-team case, rotate credentials, rerun every gate, and reactivate one component at a time.

Deterministic application use can remain available if its boundary is unaffected.
