import { z } from "zod";
import {
  healthOperations,
  type AuthorizationContext,
  type HealthOperation,
  type HealthScope,
  HealthQueryService,
} from "@rohith-health/query";

export interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  operation: HealthOperation;
  requiredScope: HealthScope;
}

const pairs: ReadonlyArray<
  [string, string, string, HealthOperation, HealthScope]
> = [
  [
    "health_get_capabilities",
    "Get health capabilities",
    "List supported aggregate metrics, sources, limits, and privacy scope.",
    "getCapabilities",
    "health.summary.read",
  ],
  [
    "health_get_data_freshness",
    "Get data freshness",
    "Check current, partial, delayed, stale, failed, or empty source state.",
    "getDataFreshness",
    "health.freshness.read",
  ],
  [
    "health_get_today_summary",
    "Get today summary",
    "Return today's bounded aggregate health summary with evidence.",
    "getTodaySummary",
    "health.summary.read",
  ],
  [
    "health_get_daily_summary",
    "Get daily summary",
    "Return one date's aggregate summary.",
    "getDailySummary",
    "health.summary.read",
  ],
  [
    "health_get_sleep_summary",
    "Get sleep summary",
    "Return bounded sleep aggregates; missing values stay missing.",
    "getSleepSummary",
    "health.sleep.read",
  ],
  [
    "health_get_sleep_trends",
    "Get sleep trends",
    "Return a bounded sleep trend with freshness and baseline maturity.",
    "getSleepTrends",
    "health.sleep.read",
  ],
  [
    "health_get_activity_summary",
    "Get activity summary",
    "Return bounded step, energy, and workout aggregates.",
    "getActivitySummary",
    "health.activity.read",
  ],
  [
    "health_get_activity_trends",
    "Get activity trends",
    "Return bounded activity trends without raw location data.",
    "getActivityTrends",
    "health.activity.read",
  ],
  [
    "health_get_heart_summary",
    "Get heart summary",
    "Return daily heart aggregates only; no diagnosis or raw minute series.",
    "getHeartSummary",
    "health.heart.read",
  ],
  [
    "health_get_wellbeing_summary",
    "Get wellbeing summary",
    "Return optional ratings only; private notes are excluded.",
    "getWellbeingSummary",
    "health.wellbeing.read",
  ],
  [
    "health_get_baseline_status",
    "Get baseline status",
    "Explain per-metric insufficient, provisional, or mature baseline status.",
    "getBaselineStatus",
    "health.baseline.read",
  ],
  [
    "health_get_coach_findings",
    "Get coach findings",
    "Return deterministic evidence-backed findings and at most three actions.",
    "getCoachFindings",
    "health.coach.read",
  ],
  [
    "health_compare_periods",
    "Compare periods",
    "Compare two bounded aggregate periods without causal claims.",
    "compareDateRanges",
    "health.summary.read",
  ],
  [
    "health_list_missing_data",
    "List missing data",
    "List dates with missing aggregate coverage.",
    "listMissingData",
    "health.summary.read",
  ],
  [
    "health_get_report",
    "Get report",
    "Return a previously generated deterministic aggregate report.",
    "getReport",
    "health.reports.read",
  ],
  [
    "health_explain_metric",
    "Explain metric",
    "Explain an allowlisted metric's meaning and calculation limits.",
    "explainMetric",
    "health.summary.read",
  ],
  [
    "health_get_experiment_result",
    "Get experiment result",
    "Return a bounded before-and-after aggregate result with confounder warning.",
    "getExperimentResult",
    "health.summary.read",
  ],
];

export const toolDefinitions: readonly ToolDefinition[] = pairs.map(
  ([name, title, description, operation, requiredScope]) => ({
    name,
    title,
    description,
    operation,
    requiredScope,
  }),
);

export const toolInputShape = {
  start: z.iso
    .date()
    .optional()
    .describe("Resolved local start date; default range is 28 days."),
  end: z.iso
    .date()
    .optional()
    .describe("Resolved local end date; ordinary maximum is 90 days."),
  metric: z
    .enum([
      "sleep_minutes",
      "steps",
      "active_energy_kcal",
      "workout_minutes",
      "resting_heart_rate",
      "hrv_sdnn_ms",
      "energy_rating",
      "focus_rating",
    ])
    .optional(),
};

export async function executeTool(
  service: HealthQueryService,
  definition: ToolDefinition,
  input: {
    start?: string | undefined;
    end?: string | undefined;
    metric?:
      | "sleep_minutes"
      | "steps"
      | "active_energy_kcal"
      | "workout_minutes"
      | "resting_heart_rate"
      | "hrv_sdnn_ms"
      | "energy_rating"
      | "focus_rating"
      | undefined;
  },
  auth: AuthorizationContext,
): Promise<Record<string, unknown>> {
  const dateRange =
    input.start && input.end
      ? { start: input.start, end: input.end }
      : undefined;
  const result = await service.execute(
    definition.operation,
    {
      ...(dateRange ? { dateRange } : {}),
      ...(input.metric ? { metric: input.metric } : {}),
    },
    auth,
  );
  return result as unknown as Record<string, unknown>;
}

export function operationCompletenessCheck(): boolean {
  return (
    toolDefinitions.every((tool) =>
      healthOperations.includes(tool.operation),
    ) && toolDefinitions.length === 17
  );
}
