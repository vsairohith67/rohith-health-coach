import { z } from "zod";

export const visualizationIntentSchema = z
  .object({
    schema_version: z.literal("1.0"),
    visualization: z.enum([
      "time_series",
      "comparison_bar",
      "sleep_interval",
      "scatter",
      "completeness_matrix",
      "none",
    ]),
    metric: z.enum([
      "sleep_minutes",
      "steps",
      "active_energy_kcal",
      "workout_minutes",
      "resting_heart_rate",
      "hrv_sdnn_ms",
      "energy_rating",
      "focus_rating",
    ]),
    title: z.string().min(1).max(100),
    series: z
      .array(
        z
          .object({
            date: z.iso.date(),
            value: z.number().finite().nullable(),
            partial: z.boolean(),
          })
          .strict(),
      )
      .max(90),
  })
  .strict();

export type VisualizationIntent = z.infer<typeof visualizationIntentSchema>;

export const toSafePlot = (
  intent: VisualizationIntent,
): Array<{ label: string; value: number | null; partial: boolean }> =>
  intent.series.map((point) => ({
    label: point.date.slice(5),
    value: point.value,
    partial: point.partial,
  }));
