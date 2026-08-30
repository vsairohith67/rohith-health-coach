# Source arbitration

Rohith Health Coach never treats two device or app totals as independent merely because both are present. Overlapping measurements are preserved as provenance, not added together.

## Canonical provenance

Every raw observation retains:

- metric and explicit unit
- start and end timestamps
- ingestion provider and import channel
- source name and bundle when available
- source-generating device name, manufacturer, model, and local identifier when available
- server device identity
- source record ID when available
- a source-namespaced server hash
- aggregation shape (`daily_total`, `interval_delta`, `session_total`, or `point_summary`)
- coverage state (`complete`, `partial`, or `unknown`)

The server hash includes metric, provider, source bundle/name, source-device identifier, registered ingestion device, and either the source record ID or a deterministic fallback fingerprint. Reusing the same record ID in two different source namespaces does not collapse the records.

## Priority

For supported daily analytics, the order is:

1. valid Garmin Connect/CIRQA-derived coverage
2. iPhone only when Garmin coverage does not exist for that period
3. Apple Watch or another explicitly approved source
4. manual observations where the metric permits them
5. unknown sources are diagnostic-only when they conflict

Priority is not a maximum-value rule. It is not a sum rule. A generic Apple Health or Apple Fitness total is not classified as Garmin without explicit provenance evidence.

## Metric/date decision

For each metric and local date:

1. remove exact replays only inside the same source namespace;
2. validate timestamps, units, aggregation shape, and coverage;
3. build one candidate per source identity;
4. choose the highest-priority valid source;
5. preserve lower-priority candidates as alternatives;
6. record overlapping disagreements in diagnostics without adding them;
7. emit no value when equal-priority or unknown sources have ambiguous conflicting overlap.

Cross-source addition is allowed only for interval deltas when the intervals do not overlap and the fallback interval is explicitly marked as a confirmed gap in the authoritative source. Daily totals are never spliced. If that proof is absent, one source is selected with its real completeness state or the result is unavailable/conflicted.

The decision is stored beneath the metric key in `daily_metrics.source_coverage`. It contains status, selected observation IDs, alternatives, conflicts, coverage, comparison eligibility, and a stable diagnostic code. Raw alternatives remain in `raw_health_samples`.

## Current partial day

A current or partial day is never treated as comparable to a complete historic day. The canonical value may be displayed as partial, but baseline and trend code must require `comparisonEligible: true`.

## Sleep

Valid Garmin-derived sleep is authoritative over a manual record. The manual record remains traceable as an alternative. Ambiguous overlapping device sessions are not added.

## Workouts

Workout deduplication is separate from numeric aggregation. A Garmin workout imported through Apple Health and the same Garmin activity imported from FIT become one logical workout when a shared activity ID exists, or when a conservative match agrees on Garmin origin, activity type, at least 80% time overlap, duration within five minutes, and distance within 5%. FIT is the canonical copy because it normally has richer detail. Non-overlapping iPhone and Garmin activities remain separate.

## Apple Shortcut safety boundary

Apple's public Shortcuts guide documents `Find Health Samples` and generic filtering, but does not provide a stable, exhaustive contract guaranteeing that source revision, source bundle, Health sample UUID, and generating device are exposed as Shortcut fields on every current iOS version. Native HealthKit does expose object UUID, source revision, and device, but that does not prove that Shortcuts exposes the same fields.

Therefore the first real Shortcut pilot must exclude Steps unless a manual run on the actual iPhone proves that each exported Step sample includes reliable Garmin-versus-iPhone provenance. If provenance is missing or ambiguous, the server keeps the raw observations and publishes no daily step number. No real pilot is started in RC5.
