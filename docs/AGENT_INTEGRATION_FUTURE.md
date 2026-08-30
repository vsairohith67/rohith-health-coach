# Agent integration future

RC4 implements read-only query/MCP foundations. Future changes may add richer scheduling or reminders only after separate review. Agent writes, background monitoring, autonomous care decisions, direct database access, arbitrary SQL, and unrestricted date extraction are prohibited by default.

Any write tool must be narrow, reversible, separately scoped/consented, preview its change, preserve deterministic authority, record a safe audit event, and require explicit confirmation for external messages, data deletion, medical routines, or other consequential actions.
