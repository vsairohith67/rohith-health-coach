import { z } from "zod";

export const metricTypeSchema = z.enum([
  "sleep_analysis",
  "steps",
  "active_energy",
  "resting_energy",
  "walking_running_distance",
  "workout",
  "heart_rate",
  "resting_heart_rate",
  "hrv_sdnn",
  "body_mass",
  "water",
]);

export const healthSampleV1Schema = z
  .object({
    metric_type: metricTypeSchema,
    start_at: z.iso.datetime({ offset: true }),
    end_at: z.iso.datetime({ offset: true }),
    numeric_value: z
      .number()
      .finite()
      .min(-1_000_000)
      .max(1_000_000)
      .nullable(),
    text_value: z.string().max(200).nullable(),
    category_value: z.string().max(80).nullable(),
    unit: z.string().max(40).nullable(),
    source_name: z.string().min(1).max(120),
    source_bundle: z.string().max(180).nullable(),
    source_record_id: z.string().max(200).nullable(),
    metadata: z.record(z.string(), z.unknown()),
  })
  .strict()
  .refine(
    (sample) => Date.parse(sample.start_at) <= Date.parse(sample.end_at),
    "end_at must not precede start_at",
  );

export const healthEnvelopeV1Schema = z
  .object({
    schema_version: z.literal("1.0"),
    export_id: z.uuid(),
    exported_at: z.iso.datetime({ offset: true }),
    timezone: z.string().min(1).max(80),
    device: z
      .object({
        device_id: z.string().min(1).max(100),
        device_name: z.string().min(1).max(120),
        source: z.literal("apple_shortcut"),
        shortcut_version: z.string().regex(/^\d+\.\d+(?:\.\d+)?$/),
      })
      .strict(),
    window: z
      .object({
        start: z.iso.datetime({ offset: true }),
        end: z.iso.datetime({ offset: true }),
      })
      .strict(),
    samples: z.array(healthSampleV1Schema).max(2_000),
  })
  .strict()
  .refine(
    (envelope) =>
      Date.parse(envelope.window.start) <= Date.parse(envelope.window.end),
    "invalid export window",
  );

export type HealthEnvelopeV1 = z.infer<typeof healthEnvelopeV1Schema>;

export interface IngestionResult {
  ok: boolean;
  request_id: string;
  ingestion_event_id: string;
  received: number;
  inserted: number;
  duplicates: number;
  rejected: number;
  conflicts: number;
  affected_dates: string[];
}

export function safeIngestionError(
  requestId: string,
  code: string,
): { ok: false; request_id: string; error_code: string } {
  return {
    ok: false,
    request_id: requestId,
    error_code: code.replace(/[^A-Z0-9_]/g, "_").slice(0, 64),
  };
}
