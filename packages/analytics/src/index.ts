import type { BaselineStatus, DailyMetric } from "@rohith-health/domain";

export const ANALYTICS_VERSION = "analytics-1.0" as const;

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const value = sorted[middle];
  if (value === undefined) return null;
  if (sorted.length % 2 === 1) return value;
  const previous = sorted[middle - 1];
  return previous === undefined ? value : (previous + value) / 2;
}

export function medianAbsoluteDeviation(
  values: readonly number[],
): number | null {
  const centre = median(values);
  return centre === null
    ? null
    : median(values.map((value) => Math.abs(value - centre)));
}

export function baselineStatus(validDays: number): BaselineStatus {
  if (validDays < 7) return "insufficient";
  if (validDays < 28) return "provisional";
  return "mature";
}

export interface MetricSummary {
  metric: "sleep_minutes" | "steps" | "resting_heart_rate";
  current: number | null;
  median28: number | null;
  difference: number | null;
  validDays: number;
  maturity: BaselineStatus;
  completeness: number;
}

export function summarizeMetric(
  days: readonly DailyMetric[],
  metric: MetricSummary["metric"],
): MetricSummary {
  const field =
    metric === "sleep_minutes"
      ? "sleepMinutes"
      : metric === "steps"
        ? "steps"
        : "restingHeartRate";
  const recent = days.slice(-28);
  const values = recent.flatMap((day) => {
    const value = day[field];
    return value === null ? [] : [value];
  });
  const current = days.at(-1)?.[field] ?? null;
  const typical = median(values);
  return {
    metric,
    current,
    median28: typical,
    difference: current === null || typical === null ? null : current - typical,
    validDays: values.length,
    maturity: baselineStatus(values.length),
    completeness:
      recent.length === 0
        ? 0
        : Math.round((values.length / recent.length) * 100),
  };
}

export function listMissingDates(
  days: readonly DailyMetric[],
  metric: MetricSummary["metric"],
): string[] {
  const field =
    metric === "sleep_minutes"
      ? "sleepMinutes"
      : metric === "steps"
        ? "steps"
        : "restingHeartRate";
  return days.filter((day) => day[field] === null).map((day) => day.localDate);
}

export function pearsonCorrelation(
  pairs: readonly { x: number | null; y: number | null }[],
): { value: number | null; n: number } {
  const valid = pairs.filter(
    (pair): pair is { x: number; y: number } =>
      pair.x !== null && pair.y !== null,
  );
  if (valid.length < 7) return { value: null, n: valid.length };
  const xMean = valid.reduce((sum, pair) => sum + pair.x, 0) / valid.length;
  const yMean = valid.reduce((sum, pair) => sum + pair.y, 0) / valid.length;
  let numerator = 0;
  let xSquare = 0;
  let ySquare = 0;
  for (const pair of valid) {
    const x = pair.x - xMean;
    const y = pair.y - yMean;
    numerator += x * y;
    xSquare += x * x;
    ySquare += y * y;
  }
  const denominator = Math.sqrt(xSquare * ySquare);
  return {
    value: denominator === 0 ? null : numerator / denominator,
    n: valid.length,
  };
}
