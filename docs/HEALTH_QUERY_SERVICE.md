# Health Query Service

The service is the single bounded read path for web Ask, MCP, widgets, and future narrators.

Eighteen operations cover capabilities/sources, freshness, today/daily/sleep/activity/heart/wellbeing summaries and trends, baseline status, deterministic findings, period comparison, missing data, reports, metric explanation, and experiment results. Seventeen are exposed as MCP tools; supported-source discovery is returned through capabilities rather than a duplicate MCP tool.

Authorization requires a non-empty subject, unexpired/non-revoked context, and the operation’s least scope. Repository queries always receive that subject and an absolute date range. The default is 28 days, ordinary maximum 90, separately authorized maximum 365, with at most 366 days and 3,000 metric points returned.

Every result carries schema version, request ID, generated time, user timezone, absolute range, freshness, completeness, baseline maturity, source timestamps, metric units, partial/quality flags, findings, evidence references, and limitations. Missing values are preserved. Unsupported metrics fail rather than being inferred.
