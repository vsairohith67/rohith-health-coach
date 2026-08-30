export type FreshnessStatus =
  | "current"
  | "partial"
  | "delayed"
  | "stale"
  | "failed"
  | "no_data";
export type BaselineStatus =
  | "insufficient"
  | "provisional"
  | "mature"
  | "unavailable";
export type Confidence = "low" | "moderate" | "high";

export interface DailyMetric {
  userId: string;
  localDate: string;
  timezone: string;
  dayCompletionStatus: "complete" | "partial" | "missing" | "conflicting";
  sleepMinutes: number | null;
  bedtimeLocal: string | null;
  wakeTimeLocal: string | null;
  steps: number | null;
  activeEnergyKcal: number | null;
  workoutMinutes: number | null;
  restingHeartRate: number | null;
  hrvSdnnMs: number | null;
  energyRating: number | null;
  focusRating: number | null;
  completenessPercent: number;
  source: "demo";
  sourceTimestamp: string;
  qualityFlags: string[];
}

export interface Evidence {
  id: string;
  metric: string;
  localDate: string;
  source: string;
  value: number | null;
  unit: string | null;
  partial: boolean;
}

export interface CoachFinding {
  id: string;
  category:
    | "sleep"
    | "activity"
    | "freshness"
    | "baseline"
    | "positive"
    | "safety";
  headline: string;
  observation: string;
  baselineComparison: string;
  interpretation: string;
  action: string | null;
  evidenceIds: string[];
  confidence: Confidence;
  completeness: number;
  severity: "information" | "attention" | "urgent";
  limitations: string[];
  generatedAt: string;
  calculationVersion: "coach-1.0";
}

export interface DemoProfile {
  syntheticOnly: true;
  label: "Demo data — not Rohith’s real health information.";
  seed: string;
  generatedAt: string;
  timezone: "Asia/Kolkata";
  days: DailyMetric[];
}

const dateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const seededRandom = (seedText: string): (() => number) => {
  let seed = 2166136261;
  for (const character of seedText) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export function generateDemoProfile(
  options: { seed?: string; days?: number; endDate?: string } = {},
): DemoProfile {
  const seed = options.seed ?? "rohith-health-demo-v1";
  const count = Math.max(7, Math.min(options.days ?? 90, 365));
  const end = new Date(`${options.endDate ?? "2026-08-28"}T12:00:00.000Z`);
  const random = seededRandom(seed);
  const days: DailyMetric[] = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - offset);
    const index = count - 1 - offset;
    const missing = index % 19 === 8 || index % 31 === 12;
    const conflicting = index % 37 === 17;
    const partial = offset === 0;
    const sleep = missing
      ? null
      : Math.round(404 + Math.sin(index / 6) * 31 + (random() - 0.5) * 52);
    const steps = missing
      ? null
      : Math.max(
          900,
          Math.round(
            6500 + Math.sin(index / 5) * 2100 + (random() - 0.5) * 2400,
          ),
        );
    const sourceTimestamp = new Date(
      `${dateOnly(date)}T${partial ? "07:12" : "23:40"}:00.000Z`,
    ).toISOString();
    days.push({
      userId: "demo-user",
      localDate: dateOnly(date),
      timezone: "Asia/Kolkata",
      dayCompletionStatus: missing
        ? "missing"
        : conflicting
          ? "conflicting"
          : partial
            ? "partial"
            : "complete",
      sleepMinutes: sleep,
      bedtimeLocal: missing
        ? null
        : `23:${String(5 + ((index * 7) % 48)).padStart(2, "0")}`,
      wakeTimeLocal: missing
        ? null
        : `06:${String(8 + ((index * 11) % 42)).padStart(2, "0")}`,
      steps,
      activeEnergyKcal: steps === null ? null : Math.round(170 + steps * 0.034),
      workoutMinutes: missing ? null : index % 3 === 0 ? 34 + (index % 20) : 0,
      restingHeartRate: missing
        ? null
        : Math.round(59 + Math.sin(index / 8) * 3 + random() * 3),
      hrvSdnnMs:
        index % 4 === 0 && !missing ? Math.round(42 + random() * 15) : null,
      energyRating: index % 3 === 0 && !missing ? 2 + (index % 4) : null,
      focusRating: index % 4 === 0 && !missing ? 2 + ((index + 1) % 4) : null,
      completenessPercent: missing ? 0 : partial ? 68 : conflicting ? 72 : 92,
      source: "demo",
      sourceTimestamp,
      qualityFlags: missing
        ? ["missing"]
        : conflicting
          ? ["source_conflict"]
          : partial
            ? ["partial_day"]
            : [],
    });
  }

  return {
    syntheticOnly: true,
    label: "Demo data — not Rohith’s real health information.",
    seed,
    generatedAt: end.toISOString(),
    timezone: "Asia/Kolkata",
    days,
  };
}

export const DEMO_PROFILE = generateDemoProfile();
