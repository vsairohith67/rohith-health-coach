import { describe, expect, it } from "vitest";

import {
  arbitrateMetric,
  classifySource,
  deduplicateObservations,
  deduplicateWorkouts,
  type MetricObservation,
  type SourceKind,
  type WorkoutObservation,
} from "./index";

const metricObservation = (
  id: string,
  sourceKind: SourceKind,
  value: number,
  overrides: Partial<MetricObservation> = {},
): MetricObservation => ({
  id,
  metric: "steps",
  value,
  unit: "count",
  startAt: "2026-08-29T00:00:00+05:30",
  endAt: "2026-08-30T00:00:00+05:30",
  sourceKind,
  provenance: {
    provider: sourceKind === "garmin" ? "garmin_connect" : "apple_health",
    sourceName: sourceKind,
    sourceBundle: `com.synthetic.${sourceKind}.${id}`,
    deviceId: `device-${sourceKind}`,
    sourceRecordId: id,
    sourceHash: `hash-${id}`,
    importChannel: "apple_health",
  },
  aggregation: "daily_total",
  coverage: "complete",
  currentDay: false,
  fallbackGapConfirmed: false,
  valid: true,
  ...overrides,
});

const workout = (
  id: string,
  sourceKind: SourceKind,
  importChannel: WorkoutObservation["importChannel"],
  overrides: Partial<WorkoutObservation> = {},
): WorkoutObservation => ({
  id,
  activityType: "running",
  startAt: "2026-08-29T06:00:00+05:30",
  endAt: "2026-08-29T07:00:00+05:30",
  durationSeconds: 3_600,
  distanceMeters: 10_000,
  sourceKind,
  importChannel,
  sourceActivityId: "garmin-activity-1",
  sourceHash: `hash-${id}`,
  ...overrides,
});

describe("RC5 source arbitration matrix", () => {
  it("CASE A — selects Garmin 4,861 over overlapping iPhone 8,148 without summing", () => {
    const decision = arbitrateMetric([
      metricObservation("garmin-a", "garmin", 4_861),
      metricObservation("iphone-a", "iphone", 8_148),
    ]);

    expect(decision.status).toBe("selected");
    expect(decision.value).toBe(4_861);
    expect(decision.value).not.toBe(13_009);
    expect(decision.authoritativeSourceKey).toContain("garmin");
    expect(decision.alternatives).toHaveLength(1);
    expect(decision.conflicts[0]?.code).toBe("overlap_not_combined");
  });

  it("CASE B — keeps a valid full Garmin day authoritative", () => {
    const decision = arbitrateMetric([
      metricObservation("garmin-b", "garmin", 4_861),
      metricObservation("iphone-b", "iphone", 5_024),
    ]);

    expect(decision.value).toBe(4_861);
    expect(decision.authoritativeSourceKey).toContain("garmin");
  });

  it("CASE C — combines only explicitly confirmed non-overlapping fallback intervals", () => {
    const decision = arbitrateMetric([
      metricObservation("garmin-c", "garmin", 4_000, {
        aggregation: "interval_delta",
        coverage: "partial",
        startAt: "2026-08-29T00:00:00+05:30",
        endAt: "2026-08-29T15:00:00+05:30",
      }),
      metricObservation("iphone-c", "iphone", 700, {
        aggregation: "interval_delta",
        coverage: "partial",
        startAt: "2026-08-29T15:00:00+05:30",
        endAt: "2026-08-29T17:00:00+05:30",
        fallbackGapConfirmed: true,
      }),
    ]);

    expect(decision.status).toBe("combined_safe_fallback");
    expect(decision.value).toBe(4_700);
    expect(decision.selectedObservationIds).toHaveLength(2);
  });

  it("CASE D — collapses a Garmin Apple Health workout and the same FIT activity", () => {
    const logical = deduplicateWorkouts([
      workout("apple-copy", "garmin", "apple_health"),
      workout("fit-copy", "garmin", "garmin_fit"),
    ]);

    expect(logical).toHaveLength(1);
    expect(logical[0]?.canonical.importChannel).toBe("garmin_fit");
    expect(logical[0]?.mergedObservationIds).toHaveLength(2);
  });

  it("CASE E — preserves distinct non-overlapping iPhone and Garmin activities", () => {
    const logical = deduplicateWorkouts([
      workout("iphone-e", "iphone", "apple_health", {
        sourceActivityId: "iphone-activity",
        startAt: "2026-08-29T05:00:00+05:30",
        endAt: "2026-08-29T05:30:00+05:30",
        durationSeconds: 1_800,
      }),
      workout("garmin-e", "garmin", "garmin_fit", {
        sourceActivityId: "garmin-activity",
        startAt: "2026-08-29T06:00:00+05:30",
        endAt: "2026-08-29T07:00:00+05:30",
      }),
    ]);

    expect(logical).toHaveLength(2);
  });

  it("CASE F — prefers valid Garmin-derived sleep while preserving manual sleep", () => {
    const decision = arbitrateMetric([
      metricObservation("manual-sleep", "manual", 390, {
        metric: "sleep_minutes",
        unit: "min",
        aggregation: "session_total",
      }),
      metricObservation("garmin-sleep", "garmin", 420, {
        metric: "sleep_minutes",
        unit: "min",
        aggregation: "session_total",
      }),
    ]);

    expect(decision.value).toBe(420);
    expect(decision.authoritativeSourceKey).toContain("garmin");
    expect(decision.alternatives[0]?.sourceKind).toBe("manual");
  });

  it("CASE G — marks a current partial day ineligible for complete-day comparison", () => {
    const decision = arbitrateMetric([
      metricObservation("garmin-current", "garmin", 2_100, {
        coverage: "partial",
        currentDay: true,
      }),
    ]);

    expect(decision.coverage).toBe("partial");
    expect(decision.comparisonEligible).toBe(false);
  });

  it("CASE H — uses iPhone as fallback only when Garmin is absent", () => {
    const decision = arbitrateMetric([
      metricObservation("iphone-only", "iphone", 7_200),
    ]);

    expect(decision.status).toBe("fallback");
    expect(decision.value).toBe(7_200);
    expect(decision.authoritativeSourceKey).toContain("iphone");
  });

  it("CASE I — returns conflict and no invented total for ambiguous equal-priority sources", () => {
    const decision = arbitrateMetric([
      metricObservation("other-one", "approved_other", 6_000, {
        provenance: {
          provider: "other_one",
          sourceName: "Other One",
          sourceBundle: "com.synthetic.one",
          deviceId: "other-device-one",
          sourceRecordId: "other-one",
          sourceHash: "hash-other-one",
          importChannel: "other",
        },
      }),
      metricObservation("other-two", "approved_other", 8_000, {
        provenance: {
          provider: "other_two",
          sourceName: "Other Two",
          sourceBundle: "com.synthetic.two",
          deviceId: "other-device-two",
          sourceRecordId: "other-two",
          sourceHash: "hash-other-two",
          importChannel: "other",
        },
      }),
    ]);

    expect(decision.status).toBe("conflict");
    expect(decision.value).toBeNull();
    expect(decision.diagnosticCode).toBe("AMBIGUOUS_SOURCE_CONFLICT");
  });
});

describe("source provenance safeguards", () => {
  it("does not collapse the same record ID across different source namespaces", () => {
    const observations = [
      metricObservation("shared-record", "garmin", 100),
      metricObservation("shared-record", "iphone", 100),
    ];

    expect(deduplicateObservations(observations).canonical).toHaveLength(2);
  });

  it("deduplicates a repeated record only inside the same source namespace", () => {
    const original = metricObservation("same-source", "garmin", 100);
    const replay = {
      ...original,
      id: "same-source-replay",
      provenance: { ...original.provenance },
    };
    const result = deduplicateObservations([original, replay]);

    expect(result.canonical).toHaveLength(1);
    expect(result.duplicates).toEqual([
      {
        duplicateId: "same-source-replay",
        canonicalId: "same-source",
        reason: "source_record_id",
      },
    ]);
  });

  it("keeps generic Apple Health provenance unknown while recognizing explicit Garmin evidence", () => {
    expect(
      classifySource({
        provider: "apple_health",
        sourceName: "Health",
        sourceBundle: "com.apple.Health",
        deviceName: null,
        deviceManufacturer: null,
        deviceModel: null,
      }),
    ).toBe("unknown");
    expect(
      classifySource({
        provider: "apple_health",
        sourceName: "Garmin Connect",
        sourceBundle: "com.garmin.connect.mobile",
        deviceName: null,
        deviceManufacturer: "Garmin",
        deviceModel: "Synthetic",
      }),
    ).toBe("garmin");
  });
});
