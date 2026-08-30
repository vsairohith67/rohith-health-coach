import { describe, expect, it } from "vitest";

import {
  baselineStatus,
  median,
  medianAbsoluteDeviation,
  pearsonCorrelation,
} from "./index";

describe("deterministic analytics", () => {
  it("calculates robust centre and dispersion", () => {
    expect(median([100, 3, 4, 5, 6])).toBe(5);
    expect(medianAbsoluteDeviation([1, 2, 3, 100])).toBe(1);
  });

  it("does not call a short baseline mature", () => {
    expect(baselineStatus(6)).toBe("insufficient");
    expect(baselineStatus(7)).toBe("provisional");
    expect(baselineStatus(28)).toBe("mature");
  });

  it("requires at least seven pairs for a correlation", () => {
    expect(
      pearsonCorrelation(
        Array.from({ length: 6 }, (_, index) => ({ x: index, y: index })),
      ),
    ).toEqual({ value: null, n: 6 });
    const pairs: Array<{ x: number | null; y: number | null }> = Array.from(
      { length: 7 },
      (_, index) => ({ x: index, y: index }),
    );
    pairs.push({ x: null, y: 4 });
    expect(pearsonCorrelation(pairs).value).toBeCloseTo(1);
  });
});
