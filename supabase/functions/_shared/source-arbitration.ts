// Pure deterministic arbitration shared by hosted ingestion and local tests.
export type ArbitratedMetric =
  | "steps"
  | "walking_running_distance"
  | "active_energy"
  | "workout_minutes"
  | "sleep_minutes"
  | "heart_rate";

export type SourceKind =
  | "garmin"
  | "iphone"
  | "apple_watch"
  | "approved_other"
  | "manual"
  | "unknown";

export type CoverageState = "complete" | "partial" | "unknown";
export type ObservationAggregation =
  | "daily_total"
  | "interval_delta"
  | "session_total"
  | "point_summary";

export interface SourceProvenance {
  provider: string;
  sourceName: string;
  sourceBundle: string | null;
  deviceId: string | null;
  sourceRecordId: string | null;
  sourceHash: string | null;
  importChannel: "apple_health" | "garmin_fit" | "manual" | "other";
}

export interface MetricObservation {
  id: string;
  metric: ArbitratedMetric;
  value: number;
  unit: string;
  startAt: string;
  endAt: string;
  sourceKind: SourceKind;
  provenance: SourceProvenance;
  aggregation: ObservationAggregation;
  coverage: CoverageState;
  currentDay: boolean;
  fallbackGapConfirmed: boolean;
  valid: boolean;
}

export interface DuplicateObservation {
  duplicateId: string;
  canonicalId: string;
  reason: "source_record_id" | "source_hash" | "fallback_fingerprint";
}

export interface SourceCandidateSummary {
  sourceKey: string;
  sourceKind: SourceKind;
  value: number;
  unit: string;
  coverage: CoverageState;
  observationIds: string[];
}

export interface ArbitrationConflict {
  code:
    | "overlap_not_combined"
    | "ambiguous_equal_priority"
    | "mixed_units"
    | "invalid_source_series";
  sourceKeys: string[];
}

export interface ArbitrationDecision {
  status:
    | "selected"
    | "fallback"
    | "combined_safe_fallback"
    | "conflict"
    | "unavailable";
  metric: ArbitratedMetric;
  value: number | null;
  unit: string | null;
  authoritativeSourceKey: string | null;
  selectedObservationIds: string[];
  alternatives: SourceCandidateSummary[];
  duplicates: DuplicateObservation[];
  conflicts: ArbitrationConflict[];
  coverage: CoverageState;
  comparisonEligible: boolean;
  diagnosticCode:
    | "AUTHORITATIVE_SOURCE_SELECTED"
    | "LOWER_PRIORITY_FALLBACK"
    | "SAFE_NON_OVERLAPPING_FALLBACK"
    | "AMBIGUOUS_SOURCE_CONFLICT"
    | "NO_VALID_SOURCE";
}

interface SourceCandidate extends SourceCandidateSummary {
  priority: number;
  aggregation: ObservationAggregation;
  currentDay: boolean;
  fallbackGapConfirmed: boolean;
  observations: MetricObservation[];
  valid: boolean;
}

const sourcePriority: Record<SourceKind, number> = {
  garmin: 10,
  iphone: 20,
  apple_watch: 30,
  approved_other: 40,
  manual: 90,
  unknown: 100,
};

export interface SourceClassificationInput {
  provider: string | null;
  sourceName: string;
  sourceBundle: string | null;
  deviceName: string | null;
  deviceManufacturer: string | null;
  deviceModel: string | null;
}

export const classifySource = (
  input: SourceClassificationInput,
): SourceKind => {
  const provider = input.provider?.trim().toLowerCase() ?? "";
  const source = input.sourceName.trim().toLowerCase();
  const bundle = input.sourceBundle?.trim().toLowerCase() ?? "";
  const device = [input.deviceName, input.deviceManufacturer, input.deviceModel]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();
  const evidence = `${provider} ${source} ${bundle} ${device}`;

  if (/\b(?:garmin|cirqa)\b/.test(evidence)) return "garmin";
  if (/\biphone\b/.test(device) || provider === "iphone") return "iphone";
  if (/\bapple watch\b/.test(device) || provider === "apple_watch")
    return "apple_watch";
  if (/\bmanual\b/.test(evidence)) return "manual";
  return "unknown";
};

const sourceKey = (observation: MetricObservation): string =>
  [
    observation.sourceKind,
    observation.provenance.provider,
    observation.provenance.sourceBundle ?? "no-bundle",
    observation.provenance.deviceId ?? "no-device",
  ].join("|");

const parseTime = (value: string): number => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const overlaps = (
  left: Pick<MetricObservation, "startAt" | "endAt">,
  right: Pick<MetricObservation, "startAt" | "endAt">,
): boolean => {
  const leftStart = parseTime(left.startAt);
  const leftEnd = parseTime(left.endAt);
  const rightStart = parseTime(right.startAt);
  const rightEnd = parseTime(right.endAt);
  return leftStart < rightEnd && rightStart < leftEnd;
};

const dedupeKey = (
  observation: MetricObservation,
): { key: string; reason: DuplicateObservation["reason"] } => {
  const namespace = sourceKey(observation);
  if (observation.provenance.sourceRecordId) {
    return {
      key: `${namespace}|record|${observation.metric}|${observation.provenance.sourceRecordId}`,
      reason: "source_record_id",
    };
  }
  if (observation.provenance.sourceHash) {
    return {
      key: `${namespace}|hash|${observation.provenance.sourceHash}`,
      reason: "source_hash",
    };
  }
  return {
    key: [
      namespace,
      "fingerprint",
      observation.metric,
      observation.startAt,
      observation.endAt,
      observation.value,
      observation.unit,
    ].join("|"),
    reason: "fallback_fingerprint",
  };
};

export const deduplicateObservations = (
  observations: readonly MetricObservation[],
): { canonical: MetricObservation[]; duplicates: DuplicateObservation[] } => {
  const seen = new Map<string, MetricObservation>();
  const canonical: MetricObservation[] = [];
  const duplicates: DuplicateObservation[] = [];

  for (const observation of observations) {
    const identity = dedupeKey(observation);
    const existing = seen.get(identity.key);
    if (existing) {
      duplicates.push({
        duplicateId: observation.id,
        canonicalId: existing.id,
        reason: identity.reason,
      });
      continue;
    }
    seen.set(identity.key, observation);
    canonical.push(observation);
  }
  return { canonical, duplicates };
};

const candidateCoverage = (
  observations: readonly MetricObservation[],
): CoverageState => {
  if (observations.every((observation) => observation.coverage === "complete"))
    return "complete";
  if (observations.some((observation) => observation.coverage === "partial"))
    return "partial";
  return "unknown";
};

const toCandidate = (
  key: string,
  observations: MetricObservation[],
): SourceCandidate => {
  const first = observations[0];
  if (!first) throw new Error("source candidate requires an observation");

  const sameMetric = observations.every(
    (observation) => observation.metric === first.metric,
  );
  const sameUnit = observations.every(
    (observation) => observation.unit === first.unit,
  );
  const sameAggregation = observations.every(
    (observation) => observation.aggregation === first.aggregation,
  );
  const validTimes = observations.every(
    (observation) =>
      Number.isFinite(parseTime(observation.startAt)) &&
      Number.isFinite(parseTime(observation.endAt)) &&
      parseTime(observation.startAt) <= parseTime(observation.endAt),
  );
  const internalOverlap = observations.some((observation, index) =>
    observations.slice(index + 1).some((other) => overlaps(observation, other)),
  );
  const requiresNonOverlap =
    first.aggregation === "interval_delta" ||
    first.aggregation === "session_total";
  const seriesValid =
    sameMetric &&
    sameUnit &&
    sameAggregation &&
    validTimes &&
    observations.every(
      (observation) => observation.valid && Number.isFinite(observation.value),
    ) &&
    (!requiresNonOverlap || !internalOverlap) &&
    (requiresNonOverlap || observations.length === 1);

  const value = requiresNonOverlap
    ? observations.reduce((total, observation) => total + observation.value, 0)
    : first.value;

  return {
    sourceKey: key,
    sourceKind: first.sourceKind,
    priority: sourcePriority[first.sourceKind],
    value,
    unit: first.unit,
    coverage: candidateCoverage(observations),
    observationIds: observations.map((observation) => observation.id),
    aggregation: first.aggregation,
    currentDay: observations.some((observation) => observation.currentDay),
    fallbackGapConfirmed: observations.every(
      (observation) => observation.fallbackGapConfirmed,
    ),
    observations,
    valid: seriesValid,
  };
};

const buildCandidates = (
  observations: readonly MetricObservation[],
): SourceCandidate[] => {
  const grouped = new Map<string, MetricObservation[]>();
  for (const observation of observations) {
    const key = sourceKey(observation);
    const group = grouped.get(key) ?? [];
    group.push(observation);
    grouped.set(key, group);
  }
  return [...grouped].map(([key, group]) => toCandidate(key, group));
};

const candidatesOverlap = (
  left: SourceCandidate,
  right: SourceCandidate,
): boolean =>
  left.observations.some((leftObservation) =>
    right.observations.some((rightObservation) =>
      overlaps(leftObservation, rightObservation),
    ),
  );

const candidateSummary = (
  candidate: SourceCandidate,
): SourceCandidateSummary => ({
  sourceKey: candidate.sourceKey,
  sourceKind: candidate.sourceKind,
  value: candidate.value,
  unit: candidate.unit,
  coverage: candidate.coverage,
  observationIds: candidate.observationIds,
});

export const arbitrateMetric = (
  observations: readonly MetricObservation[],
): ArbitrationDecision => {
  const first = observations[0];
  if (!first) {
    return {
      status: "unavailable",
      metric: "steps",
      value: null,
      unit: null,
      authoritativeSourceKey: null,
      selectedObservationIds: [],
      alternatives: [],
      duplicates: [],
      conflicts: [],
      coverage: "unknown",
      comparisonEligible: false,
      diagnosticCode: "NO_VALID_SOURCE",
    };
  }

  const sameMetric = observations.every(
    (observation) => observation.metric === first.metric,
  );
  if (!sameMetric) throw new Error("arbitrateMetric requires one metric");

  const deduplicated = deduplicateObservations(observations);
  const candidates = buildCandidates(deduplicated.canonical);
  const invalidCandidates = candidates.filter((candidate) => !candidate.valid);
  const validCandidates = candidates
    .filter((candidate) => candidate.valid)
    .sort(
      (left, right) =>
        left.priority - right.priority ||
        left.sourceKey.localeCompare(right.sourceKey),
    );

  if (validCandidates.length === 0) {
    return {
      status: "unavailable",
      metric: first.metric,
      value: null,
      unit: null,
      authoritativeSourceKey: null,
      selectedObservationIds: [],
      alternatives: candidates.map(candidateSummary),
      duplicates: deduplicated.duplicates,
      conflicts: invalidCandidates.map((candidate) => ({
        code: "invalid_source_series",
        sourceKeys: [candidate.sourceKey],
      })),
      coverage: "unknown",
      comparisonEligible: false,
      diagnosticCode: "NO_VALID_SOURCE",
    };
  }

  const chosen = validCandidates[0];
  if (!chosen) throw new Error("valid source candidate missing");
  const otherCandidates = validCandidates.slice(1);
  const mixedUnit = otherCandidates.find(
    (candidate) => candidate.unit !== chosen.unit,
  );
  if (mixedUnit) {
    return {
      status: "conflict",
      metric: first.metric,
      value: null,
      unit: null,
      authoritativeSourceKey: null,
      selectedObservationIds: [],
      alternatives: validCandidates.map(candidateSummary),
      duplicates: deduplicated.duplicates,
      conflicts: [
        {
          code: "mixed_units",
          sourceKeys: [chosen.sourceKey, mixedUnit.sourceKey],
        },
      ],
      coverage: "unknown",
      comparisonEligible: false,
      diagnosticCode: "AMBIGUOUS_SOURCE_CONFLICT",
    };
  }

  const equalPriorityConflict = otherCandidates.find(
    (candidate) =>
      candidate.priority === chosen.priority &&
      candidatesOverlap(chosen, candidate) &&
      candidate.value !== chosen.value,
  );
  if (equalPriorityConflict) {
    return {
      status: "conflict",
      metric: first.metric,
      value: null,
      unit: chosen.unit,
      authoritativeSourceKey: null,
      selectedObservationIds: [],
      alternatives: validCandidates.map(candidateSummary),
      duplicates: deduplicated.duplicates,
      conflicts: [
        {
          code: "ambiguous_equal_priority",
          sourceKeys: [chosen.sourceKey, equalPriorityConflict.sourceKey],
        },
      ],
      coverage: "unknown",
      comparisonEligible: false,
      diagnosticCode: "AMBIGUOUS_SOURCE_CONFLICT",
    };
  }

  const safeFallback = otherCandidates.find(
    (candidate) =>
      chosen.aggregation === "interval_delta" &&
      candidate.aggregation === "interval_delta" &&
      candidate.fallbackGapConfirmed &&
      !candidatesOverlap(chosen, candidate),
  );
  if (chosen.coverage === "partial" && safeFallback) {
    const selected = [...chosen.observationIds, ...safeFallback.observationIds];
    const coverage: CoverageState = "partial";
    return {
      status: "combined_safe_fallback",
      metric: first.metric,
      value: chosen.value + safeFallback.value,
      unit: chosen.unit,
      authoritativeSourceKey: chosen.sourceKey,
      selectedObservationIds: selected,
      alternatives: otherCandidates
        .filter((candidate) => candidate !== safeFallback)
        .map(candidateSummary),
      duplicates: deduplicated.duplicates,
      conflicts: invalidCandidates.map((candidate) => ({
        code: "invalid_source_series",
        sourceKeys: [candidate.sourceKey],
      })),
      coverage,
      comparisonEligible: false,
      diagnosticCode: "SAFE_NON_OVERLAPPING_FALLBACK",
    };
  }

  const overlapConflicts = otherCandidates
    .filter(
      (candidate) =>
        candidatesOverlap(chosen, candidate) &&
        candidate.value !== chosen.value,
    )
    .map<ArbitrationConflict>((candidate) => ({
      code: "overlap_not_combined",
      sourceKeys: [chosen.sourceKey, candidate.sourceKey],
    }));
  const status: ArbitrationDecision["status"] =
    chosen.sourceKind === "iphone" &&
    !validCandidates.some((candidate) => candidate.sourceKind === "garmin")
      ? "fallback"
      : "selected";

  return {
    status,
    metric: first.metric,
    value: chosen.value,
    unit: chosen.unit,
    authoritativeSourceKey: chosen.sourceKey,
    selectedObservationIds: chosen.observationIds,
    alternatives: otherCandidates.map(candidateSummary),
    duplicates: deduplicated.duplicates,
    conflicts: [
      ...overlapConflicts,
      ...invalidCandidates.map<ArbitrationConflict>((candidate) => ({
        code: "invalid_source_series",
        sourceKeys: [candidate.sourceKey],
      })),
    ],
    coverage: chosen.coverage,
    comparisonEligible: !chosen.currentDay && chosen.coverage === "complete",
    diagnosticCode:
      status === "fallback"
        ? "LOWER_PRIORITY_FALLBACK"
        : "AUTHORITATIVE_SOURCE_SELECTED",
  };
};

export interface WorkoutObservation {
  id: string;
  activityType: string;
  startAt: string;
  endAt: string;
  durationSeconds: number;
  distanceMeters: number | null;
  sourceKind: SourceKind;
  importChannel: SourceProvenance["importChannel"];
  sourceActivityId: string | null;
  sourceHash: string;
}

export interface LogicalWorkout {
  canonical: WorkoutObservation;
  mergedObservationIds: string[];
}

const workoutChannelPriority: Record<
  SourceProvenance["importChannel"],
  number
> = {
  garmin_fit: 10,
  apple_health: 20,
  other: 30,
  manual: 40,
};

const workoutOverlapRatio = (
  left: WorkoutObservation,
  right: WorkoutObservation,
): number => {
  const start = Math.max(parseTime(left.startAt), parseTime(right.startAt));
  const end = Math.min(parseTime(left.endAt), parseTime(right.endAt));
  const overlap = Math.max(0, end - start);
  const shorter = Math.min(
    parseTime(left.endAt) - parseTime(left.startAt),
    parseTime(right.endAt) - parseTime(right.startAt),
  );
  return shorter > 0 ? overlap / shorter : 0;
};

const distanceClose = (left: number | null, right: number | null): boolean => {
  if (left === null || right === null) return true;
  const denominator = Math.max(Math.abs(left), Math.abs(right), 1);
  return Math.abs(left - right) / denominator <= 0.05;
};

const sameLogicalGarminWorkout = (
  left: WorkoutObservation,
  right: WorkoutObservation,
): boolean => {
  if (left.sourceKind !== "garmin" || right.sourceKind !== "garmin")
    return false;
  const channelPair = new Set([left.importChannel, right.importChannel]);
  if (!channelPair.has("apple_health") || !channelPair.has("garmin_fit"))
    return false;
  if (
    left.sourceActivityId &&
    right.sourceActivityId &&
    left.sourceActivityId === right.sourceActivityId
  )
    return true;
  return (
    left.activityType === right.activityType &&
    workoutOverlapRatio(left, right) >= 0.8 &&
    Math.abs(left.durationSeconds - right.durationSeconds) <= 300 &&
    distanceClose(left.distanceMeters, right.distanceMeters)
  );
};

export const deduplicateWorkouts = (
  observations: readonly WorkoutObservation[],
): LogicalWorkout[] => {
  const logical: LogicalWorkout[] = [];
  for (const observation of observations) {
    const existing = logical.find(
      (candidate) =>
        (candidate.canonical.sourceHash === observation.sourceHash &&
          candidate.canonical.sourceKind === observation.sourceKind) ||
        sameLogicalGarminWorkout(candidate.canonical, observation),
    );
    if (!existing) {
      logical.push({
        canonical: observation,
        mergedObservationIds: [observation.id],
      });
      continue;
    }
    existing.mergedObservationIds.push(observation.id);
    if (
      workoutChannelPriority[observation.importChannel] <
      workoutChannelPriority[existing.canonical.importChannel]
    ) {
      existing.canonical = observation;
    }
  }
  return logical;
};
