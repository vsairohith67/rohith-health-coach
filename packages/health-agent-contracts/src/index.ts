import { z } from "zod";

export const confidenceSchema = z.enum(["low", "moderate", "high"]);
export const baselineStatusSchema = z.enum([
  "insufficient",
  "provisional",
  "mature",
  "unavailable",
]);
export const freshnessStatusSchema = z.enum([
  "current",
  "partial",
  "delayed",
  "stale",
  "failed",
  "no_data",
]);
export const supportedMetricSchema = z.enum([
  "sleep_minutes",
  "steps",
  "active_energy_kcal",
  "workout_minutes",
  "resting_heart_rate",
  "hrv_sdnn_ms",
  "energy_rating",
  "focus_rating",
]);

export const dateRangeSchema = z
  .object({ start: z.iso.date(), end: z.iso.date() })
  .strict()
  .refine((range) => range.start <= range.end, "start must not follow end");

export const queryInputSchema = z
  .object({
    dateRange: dateRangeSchema.optional(),
    metric: supportedMetricSchema.optional(),
    includeStages: z.boolean().optional(),
    granularity: z.enum(["day", "week"]).optional(),
  })
  .strict();

export const metricValueSchema = z
  .object({
    metric: supportedMetricSchema,
    value: z.number().finite().nullable(),
    unit: z.string().nullable(),
    source: z.string(),
    sourceTimestamp: z.iso.datetime(),
    partial: z.boolean(),
    qualityFlags: z.array(z.string()),
    evidenceId: z.string().min(1),
  })
  .strict();

export const evidenceSchema = z
  .object({
    id: z.string(),
    metric: z.string(),
    localDate: z.iso.date(),
    source: z.string(),
  })
  .strict();

export const resultEnvelopeSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    requestId: z.uuid(),
    generatedAt: z.iso.datetime(),
    userTimezone: z.string(),
    dateRange: dateRangeSchema,
    freshness: z
      .object({
        status: freshnessStatusSchema,
        newestSourceAt: z.iso.datetime().nullable(),
        lastImportAt: z.iso.datetime().nullable(),
      })
      .strict(),
    completeness: z
      .object({
        percent: z.number().min(0).max(100),
        validDays: z.number().int().nonnegative(),
        expectedDays: z.number().int().nonnegative(),
        missingDates: z.array(z.iso.date()),
      })
      .strict(),
    baseline: z
      .object({
        status: baselineStatusSchema,
        validDays: z.number().int().nonnegative(),
        windowDays: z.number().int().nonnegative(),
      })
      .strict(),
    metrics: z.array(metricValueSchema).max(3_000),
    findings: z
      .array(
        z
          .object({
            id: z.string(),
            headline: z.string(),
            evidenceIds: z.array(z.string()),
            confidence: confidenceSchema,
            action: z.string().nullable(),
          })
          .strict(),
      )
      .max(20),
    evidence: z.array(evidenceSchema).max(366),
    limitations: z.array(z.string()).max(20),
  })
  .strict();

export type QueryInput = z.infer<typeof queryInputSchema>;
export type ResultEnvelope = z.infer<typeof resultEnvelopeSchema>;

export const narrativeResponseSchema = z
  .object({
    schema_version: z.literal("1.0"),
    headline: z.string().min(1).max(160),
    summary: z.string().min(1).max(1_200),
    observations: z
      .array(
        z
          .object({
            text: z.string().max(500),
            evidence_ids: z.array(z.string()).max(10),
          })
          .strict(),
      )
      .max(8),
    actions: z
      .array(
        z
          .object({
            text: z.string().max(300),
            reason: z.string().max(400),
            evidence_ids: z.array(z.string()).max(10),
          })
          .strict(),
      )
      .max(3),
    confidence: confidenceSchema,
    limitations: z.array(z.string().max(400)).min(1).max(8),
    safety_classification: z.literal("informational"),
  })
  .strict();

export type NarrativeResponse = z.infer<typeof narrativeResponseSchema>;
