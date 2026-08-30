import { describe, expect, it } from "vitest";

import { visualizationIntentSchema } from "./visualization";

const valid = {
  schema_version: "1.0",
  visualization: "time_series",
  metric: "sleep_minutes",
  title: "Sleep",
  series: [{ date: "2026-08-28", value: null, partial: true }],
};

describe("ChatGPT widget visualization boundary", () => {
  it("accepts only allowlisted structured rendering intent", () => {
    expect(visualizationIntentSchema.safeParse(valid).success).toBe(true);
    expect(
      visualizationIntentSchema.safeParse({
        ...valid,
        visualization: "arbitrary_html",
      }).success,
    ).toBe(false);
    expect(
      visualizationIntentSchema.safeParse({ ...valid, script: "alert(1)" })
        .success,
    ).toBe(false);
    expect(
      visualizationIntentSchema.safeParse({ ...valid, metric: "gps_route" })
        .success,
    ).toBe(false);
  });

  it("caps series length", () => {
    expect(
      visualizationIntentSchema.safeParse({
        ...valid,
        series: Array.from({ length: 91 }, () => valid.series[0]),
      }).success,
    ).toBe(false);
  });
});
