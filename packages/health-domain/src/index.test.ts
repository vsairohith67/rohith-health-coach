import { describe, expect, it } from "vitest";

import { generateDemoProfile } from "./index";

describe("synthetic demo profile", () => {
  it("is fixed-seed deterministic and explicitly synthetic", () => {
    const first = generateDemoProfile({ seed: "test-seed", days: 90 });
    const second = generateDemoProfile({ seed: "test-seed", days: 90 });
    expect(first).toEqual(second);
    expect(first.syntheticOnly).toBe(true);
    expect(first.label).toContain("not Rohith’s real health information");
    expect(first.days).toHaveLength(90);
  });

  it("preserves missing data instead of converting it to zero", () => {
    const profile = generateDemoProfile({ seed: "test-seed", days: 90 });
    const missing = profile.days.find(
      (day) => day.dayCompletionStatus === "missing",
    );
    expect(missing?.sleepMinutes).toBeNull();
    expect(missing?.steps).toBeNull();
  });
});
