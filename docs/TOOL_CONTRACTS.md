# Tool contracts

All MCP tools are read-only, purpose-limited wrappers over one Health Query Service operation.

- Input: optional ISO local start/end pair plus one allowlisted metric where applicable. Relative language is resolved by the client before the call.
- Authorization: OAuth subject plus the exact required scope; expiry/revocation checked per call.
- Output: strict aggregate result/capability JSON. No HTML, database identifiers, tokens, notes, routes, medication, or raw FIT content.
- Bounds: 28-day default, 90-day ordinary maximum, 365-day expanded maximum, 3,000 metric points.
- Errors: stable unauthorized, forbidden, invalid-range, unsupported, and too-large categories; no stack traces/private data.

The allowlist contains: capabilities, freshness, today/daily, sleep summary/trends, activity summary/trends, heart, wellbeing, baseline, coach findings, period comparison, missing dates, report, metric explanation, and experiment result. There are no write, SQL, URL-fetch, background, notification, export-download, deletion, token-management, or provider-enable tools.
