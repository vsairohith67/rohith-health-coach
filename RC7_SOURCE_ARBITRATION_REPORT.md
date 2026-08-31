# RC7 source-arbitration report

Verified against the hosted ingestion function and database: 2026-08-31.

## Critical overlap

Synthetic full-day overlap:

- Garmin: 4,861 steps.
- iPhone: 8,148 steps.
- Selected total: **4,861**.
- Decision: authoritative Garmin source selected.
- Diagnostic: `overlap_not_combined`.
- Alternative iPhone observation: preserved with provenance.
- Forbidden total 13,009: never produced.

## Ambiguous overlap

Two equal-priority conflicting sources produced:

- selected total: `NULL` / no total.
- state: conflict.
- diagnostic: ambiguous source conflict.
- sum, maximum, and average selection: none.

## Fallback and completeness

- iPhone is eligible only when Garmin coverage is genuinely absent.
- Full overlap never causes summation.
- Partial current-day Garmin data remains marked partial and comparison-ineligible.
- All raw alternatives and source/device/bundle/record provenance remain stored.
- Garmin-derived sleep is preferred when valid.
- Workout deduplication treats the same Garmin activity arriving through Apple Health and FIT as one logical workout; distinct non-overlapping activity may remain.

## Test evidence

- Source-arbitration unit matrix: 12/12 passed.
- Hosted ingestion matrix: 26/26 passed.
- Hosted critical-value database readback: passed.

Apple Shortcuts still cannot be assumed to expose reliable source/device identity for every Health sample. Therefore Steps remain excluded from the future first real pilot. The safe future set is limited to Sleep Analysis, Active Energy, Resting Energy, Walking + Running Distance, and Workouts; no pilot was started in RC7.
