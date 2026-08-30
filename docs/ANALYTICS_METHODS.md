# Analytics methods

The product favours interpretable, deterministic methods over predictive claims.

## Daily semantics

- Aggregation follows the user’s IANA timezone and local calendar date.
- Missing observations remain `null`; zero is a valid observed value only where the metric allows it.
- Partial days are visibly flagged and are not treated as comparable complete days.
- Duplicate source records are rejected by owner plus source hash; ingestion requests are idempotent.

## Baselines and trends

The baseline uses valid days only. Status is `insufficient`, `provisional`, or `mature` according to available-day thresholds. The implementation exposes median and median absolute deviation (MAD), percentiles, a simple trend slope, completeness, and window size. Median/MAD reduce sensitivity to one unusual day. No outlier is silently deleted; quality flags remain available.

Comparisons use bounded date ranges. Ordinary callers can request at most 90 days; separately authorized expanded requests may reach 365 days. The response caps daily rows and metric points to prevent unbounded extraction.

## Association language

Correlations and before/after comparisons are descriptive. The UI and narrator must say “associated,” “coincided,” or “changed during the period,” not “caused.” Confounders, device changes, incomplete days, and baseline maturity are stated. A single night never establishes a trend.

## Reproducibility

The synthetic profile uses the fixed seed `rohith-health-demo-v1`, a fixed end date, and a 90-day window. Algorithms carry explicit versions in result/report records. Unit tests cover missing values, baselines, robust statistics, and evidence-linked coach findings.
