# Tool contract report

The Health Query Service has 18 typed operations; MCP intentionally exposes 17 user-facing read-only tools. All tool names are explicit `health_*` actions. Inputs permit only ISO date bounds and one allowlisted aggregate metric; the authorization subject is never an input. Ordinary range maximum is 90 days, explicit expanded maximum is 365 days, default is 28 days, and results cap at 3,000 points.

Outputs use versioned structured envelopes with timezone, range, source freshness, completeness, baseline maturity, evidence IDs, confidence/limitations, and at most three actions where applicable. Missing values stay null. Unsupported metrics return an explicit unsupported state. Contract completeness, input/output validation, scope enforcement, cross-user denial, malformed requests, and output bounds passed local tests. No arbitrary SQL/table/URL/write contract exists.
