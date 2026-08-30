import { summarizeMetric } from "@rohith-health/analytics";
import type {
  CoachFinding,
  DailyMetric,
  Evidence,
} from "@rohith-health/domain";

const limitation =
  "Wearable-derived trends are informational and do not identify a medical cause.";

export function createEvidence(days: readonly DailyMetric[]): Evidence[] {
  return days.slice(-28).flatMap((day) => {
    const partial = day.dayCompletionStatus !== "complete";
    const fields: Array<[string, number | null, string]> = [
      ["sleep_minutes", day.sleepMinutes, "min"],
      ["steps", day.steps, "count"],
      ["resting_heart_rate", day.restingHeartRate, "bpm"],
    ];
    return fields.map(([metric, value, unit]) => ({
      id: `ev:${metric}:${day.localDate}`,
      metric,
      localDate: day.localDate,
      source: day.source,
      value,
      unit,
      partial,
    }));
  });
}

export function generateCoachFindings(
  days: readonly DailyMetric[],
  generatedAt = "2026-08-28T12:00:00.000Z",
): CoachFinding[] {
  const current = days.at(-1);
  if (!current) return [];
  const sleep = summarizeMetric(days, "sleep_minutes");
  const steps = summarizeMetric(days, "steps");
  const findings: CoachFinding[] = [];
  const common = {
    completeness: Math.min(sleep.completeness, steps.completeness),
    generatedAt,
    calculationVersion: "coach-1.0" as const,
    limitations: [limitation],
  };

  if (current.dayCompletionStatus === "partial") {
    findings.push({
      ...common,
      id: "finding:partial-day",
      category: "freshness",
      headline: "Today is still in progress",
      observation: "Today’s totals are incomplete.",
      baselineComparison:
        "A completed-day comparison is intentionally deferred.",
      interpretation: "More source data may arrive later.",
      action: "Check source freshness before relying on today’s totals.",
      evidenceIds: [`ev:steps:${current.localDate}`],
      confidence: "high",
      severity: "information",
    });
  }

  if (
    sleep.current !== null &&
    sleep.median28 !== null &&
    sleep.current < sleep.median28 - 25
  ) {
    findings.push({
      ...common,
      id: "finding:shorter-sleep",
      category: "sleep",
      headline: "Sleep was shorter than your recent pattern",
      observation: `Recorded sleep was ${Math.round(sleep.current)} minutes.`,
      baselineComparison: `${Math.round(Math.abs(sleep.current - sleep.median28))} minutes below the 28-day median.`,
      interpretation:
        "A shorter night may contribute to lower energy, but one night does not establish a cause.",
      action: "Keep activity moderate and protect an earlier wind-down.",
      evidenceIds: [`ev:sleep_minutes:${current.localDate}`],
      confidence: sleep.completeness >= 80 ? "moderate" : "low",
      severity: "attention",
    });
  }

  if (
    steps.current !== null &&
    steps.median28 !== null &&
    steps.current >= steps.median28
  ) {
    findings.push({
      ...common,
      id: "finding:steady-activity",
      category: "positive",
      headline: "Movement is tracking near your usual range",
      observation:
        "Available movement data is consistent with the recent personal pattern.",
      baselineComparison: "The current value is at or above the 28-day median.",
      interpretation:
        "Consistency is more useful than chasing a single high day.",
      action: "Continue the current moderate movement plan.",
      evidenceIds: [`ev:steps:${current.localDate}`],
      confidence: "moderate",
      severity: "information",
    });
  }

  if (findings.length === 0) {
    findings.push({
      ...common,
      id: "finding:insufficient",
      category: "baseline",
      headline: "There is not enough current data for a stronger conclusion",
      observation: "One or more required metrics are missing.",
      baselineComparison: `Baseline status: ${sleep.maturity}.`,
      interpretation:
        "Missing information remains missing rather than being treated as zero.",
      action: null,
      evidenceIds: [],
      confidence: "low",
      severity: "information",
    });
  }

  let actions = 0;
  return findings.map((finding) => {
    if (finding.action === null) return finding;
    actions += 1;
    return actions <= 3 ? finding : { ...finding, action: null };
  });
}

const urgentPatterns = [
  /chest pain/i,
  /breath(?:ing)? difficulty|cannot breathe/i,
  /faint(?:ed|ing)?/i,
  /stroke|face (?:is )?droop(?:ing)?|slurred speech/i,
  /kill myself|suicide|self[- ]harm/i,
];

export function staticUrgentGuidance(report: string): string | null {
  if (!urgentPatterns.some((pattern) => pattern.test(report))) return null;
  return "This may need immediate help. Contact local emergency services now and ask a nearby trusted person to stay with you. This app cannot assess severity or provide emergency care.";
}
