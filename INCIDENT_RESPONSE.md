# Incident response

Severity P0: confirmed/potential cross-user or public health data, secret/service key, public FIT bucket, compromised auth/tunnel/provider, or destructive integrity loss. Immediately disable ingress/AI/MCP, restrict traffic, revoke/rotate credentials and sessions, preserve safe evidence, involve the owner/legal/security decision maker, and assess notification obligations.

P1: bounded security/control failure without confirmed exposure. Disable the component, patch/test, rotate scoped tokens when relevant, and re-run hosted synthetic gates before restore.

Evidence may include timestamps, request IDs, safe error codes, versions, configuration booleans, and counts. It must exclude values, bodies, notes, routes, files, tokens, and signed URLs. Root cause, affected period/categories/users, containment, recovery, and regression proof are required before closure.
