import { randomUUID } from "node:crypto";
import { baselineStatus } from "@rohith-health/analytics";
import { createEvidence, generateCoachFindings } from "@rohith-health/coach";
import {
  resultEnvelopeSchema,
  type QueryInput,
  type ResultEnvelope,
} from "@rohith-health/agent-contracts";
import type { DailyMetric } from "@rohith-health/domain";

export const QUERY_SERVICE_VERSION = "1.0" as const;
export const DEFAULT_RANGE_DAYS = 28;
export const ORDINARY_MAX_RANGE_DAYS = 90;
export const ABSOLUTE_MAX_RANGE_DAYS = 365;
export const MAX_RESULT_DAYS = 366;
export const MAX_RESULT_POINTS = 3_000;

export const healthOperations = [
  "getCapabilities",
  "getDataFreshness",
  "getTodaySummary",
  "getDailySummary",
  "getSleepSummary",
  "getSleepTrends",
  "getActivitySummary",
  "getActivityTrends",
  "getHeartSummary",
  "getWellbeingSummary",
  "getBaselineStatus",
  "getCoachFindings",
  "compareDateRanges",
  "listMissingData",
  "getReport",
  "explainMetric",
  "getExperimentResult",
  "getSupportedSources",
] as const;
export type HealthOperation = (typeof healthOperations)[number];

export type HealthScope =
  | "health.freshness.read"
  | "health.summary.read"
  | "health.sleep.read"
  | "health.activity.read"
  | "health.heart.read"
  | "health.baseline.read"
  | "health.coach.read"
  | "health.reports.read"
  | "health.wellbeing.read";

export interface AuthorizationContext {
  subject: string;
  scopes: ReadonlySet<HealthScope>;
  expiresAt: number;
  revoked: boolean;
  timezone: string;
  expandedRange: boolean;
}

export interface HealthRepository {
  listDailyMetrics(
    userId: string,
    start: string,
    end: string,
  ): Promise<DailyMetric[]>;
}

const operationScopes: Record<HealthOperation, HealthScope> = {
  getCapabilities: "health.summary.read",
  getDataFreshness: "health.freshness.read",
  getTodaySummary: "health.summary.read",
  getDailySummary: "health.summary.read",
  getSleepSummary: "health.sleep.read",
  getSleepTrends: "health.sleep.read",
  getActivitySummary: "health.activity.read",
  getActivityTrends: "health.activity.read",
  getHeartSummary: "health.heart.read",
  getWellbeingSummary: "health.wellbeing.read",
  getBaselineStatus: "health.baseline.read",
  getCoachFindings: "health.coach.read",
  compareDateRanges: "health.summary.read",
  listMissingData: "health.summary.read",
  getReport: "health.reports.read",
  explainMetric: "health.summary.read",
  getExperimentResult: "health.summary.read",
  getSupportedSources: "health.summary.read",
};

export class QueryServiceError extends Error {
  constructor(
    public readonly code:
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "INVALID_RANGE"
      | "UNSUPPORTED"
      | "TOO_LARGE",
  ) {
    super(code);
  }
}

function daysInclusive(start: string, end: string): number {
  return (
    Math.floor(
      (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
        86_400_000,
    ) + 1
  );
}

function subtractDays(date: string, count: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - count);
  return value.toISOString().slice(0, 10);
}

export class HealthQueryService {
  constructor(
    private readonly repository: HealthRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(
    operation: HealthOperation,
    input: QueryInput,
    auth: AuthorizationContext,
  ): Promise<ResultEnvelope | Record<string, unknown>> {
    this.authorize(operation, auth);
    if (
      operation === "getCapabilities" ||
      operation === "getSupportedSources"
    ) {
      return {
        schemaVersion: QUERY_SERVICE_VERSION,
        supportedMetrics: [
          "sleep_minutes",
          "steps",
          "active_energy_kcal",
          "workout_minutes",
          "resting_heart_rate",
          "hrv_sdnn_ms",
          "energy_rating",
          "focus_rating",
        ],
        unsupportedMetrics: [
          "garmin_body_battery",
          "garmin_stress",
          "training_readiness",
          "pulse_ox",
          "respiration",
          "blood_pressure",
        ],
        enabledProviders: ["deterministic"],
        providerPrivacyLevel: "no_external_transfer",
        maximumDateRangeDays: auth.expandedRange
          ? ABSOLUTE_MAX_RANGE_DAYS
          : ORDINARY_MAX_RANGE_DAYS,
        availableDataCategories: [
          "daily_aggregates",
          "baselines",
          "deterministic_findings",
          "freshness",
          "completeness",
        ],
      };
    }

    const today = this.now().toISOString().slice(0, 10);
    const range = input.dateRange ?? {
      start: subtractDays(today, DEFAULT_RANGE_DAYS - 1),
      end: today,
    };
    const length = daysInclusive(range.start, range.end);
    const maximum = auth.expandedRange
      ? ABSOLUTE_MAX_RANGE_DAYS
      : ORDINARY_MAX_RANGE_DAYS;
    if (!Number.isFinite(length) || length < 1 || length > maximum)
      throw new QueryServiceError("INVALID_RANGE");
    const days = await this.repository.listDailyMetrics(
      auth.subject,
      range.start,
      range.end,
    );
    if (days.length > MAX_RESULT_DAYS) throw new QueryServiceError("TOO_LARGE");
    return this.buildEnvelope(days, range.start, range.end, auth.timezone);
  }

  private authorize(
    operation: HealthOperation,
    auth: AuthorizationContext,
  ): void {
    if (!auth.subject || auth.expiresAt <= this.now().getTime() || auth.revoked)
      throw new QueryServiceError("UNAUTHORIZED");
    if (!auth.scopes.has(operationScopes[operation]))
      throw new QueryServiceError("FORBIDDEN");
  }

  private buildEnvelope(
    days: readonly DailyMetric[],
    start: string,
    end: string,
    timezone: string,
  ): ResultEnvelope {
    const newest =
      days
        .map((day) => day.sourceTimestamp)
        .sort()
        .at(-1) ?? null;
    const expected = daysInclusive(start, end);
    const valid = days.filter((day) => day.dayCompletionStatus !== "missing");
    const findings = generateCoachFindings(days);
    const evidence = createEvidence(days).filter((item) => item.value !== null);
    const metrics = days
      .flatMap((day) => {
        const partial = day.dayCompletionStatus !== "complete";
        const rows = [
          ["sleep_minutes", day.sleepMinutes, "min"],
          ["steps", day.steps, "count"],
          ["active_energy_kcal", day.activeEnergyKcal, "kcal"],
          ["workout_minutes", day.workoutMinutes, "min"],
          ["resting_heart_rate", day.restingHeartRate, "bpm"],
          ["hrv_sdnn_ms", day.hrvSdnnMs, "ms"],
          ["energy_rating", day.energyRating, "rating_1_5"],
          ["focus_rating", day.focusRating, "rating_1_5"],
        ] as const;
        return rows.map(([metric, value, unit]) => ({
          metric,
          value,
          unit,
          source: day.source,
          sourceTimestamp: day.sourceTimestamp,
          partial,
          qualityFlags: day.qualityFlags,
          evidenceId: `ev:${metric}:${day.localDate}`,
        }));
      })
      .slice(0, MAX_RESULT_POINTS);
    return resultEnvelopeSchema.parse({
      schemaVersion: QUERY_SERVICE_VERSION,
      requestId: randomUUID(),
      generatedAt: this.now().toISOString(),
      userTimezone: timezone,
      dateRange: { start, end },
      freshness: {
        status:
          days.length === 0
            ? "no_data"
            : days.at(-1)?.dayCompletionStatus === "partial"
              ? "partial"
              : "current",
        newestSourceAt: newest,
        lastImportAt: newest,
      },
      completeness: {
        percent:
          expected === 0 ? 0 : Math.round((valid.length / expected) * 100),
        validDays: valid.length,
        expectedDays: expected,
        missingDates: days
          .filter((day) => day.dayCompletionStatus === "missing")
          .map((day) => day.localDate),
      },
      baseline: {
        status: baselineStatus(valid.length),
        validDays: valid.length,
        windowDays: Math.min(expected, 28),
      },
      metrics,
      findings: findings.map((finding) => ({
        id: finding.id,
        headline: finding.headline,
        evidenceIds: finding.evidenceIds,
        confidence: finding.confidence,
        action: finding.action,
      })),
      evidence: evidence.map(({ id, metric, localDate, source }) => ({
        id,
        metric,
        localDate,
        source,
      })),
      limitations: [
        "Wearable-derived aggregate trends are informational, not a diagnosis.",
        "Missing values are omitted rather than converted to zero.",
      ],
    });
  }
}

export class InMemoryHealthRepository implements HealthRepository {
  constructor(private readonly rows: readonly DailyMetric[]) {}
  async listDailyMetrics(
    userId: string,
    start: string,
    end: string,
  ): Promise<DailyMetric[]> {
    return this.rows.filter(
      (row) =>
        row.userId === userId && row.localDate >= start && row.localDate <= end,
    );
  }
}
