import { describe, expect, it } from "vitest";

import { evalCases } from "./cases/cases";
import { gradeEvalCase } from "./graders/policy";

describe("deterministic synthetic agent evaluation suite", () => {
  it("contains at least 200 fixed synthetic cases across all required categories", () => {
    expect(evalCases.length).toBeGreaterThanOrEqual(200);
    expect(new Set(evalCases.map((testCase) => testCase.category)).size).toBe(
      11,
    );
    expect(evalCases.every((testCase) => testCase.synthetic)).toBe(true);
  });

  for (const testCase of evalCases) {
    it(`${testCase.id}: ${testCase.prompt}`, () => {
      expect(gradeEvalCase(testCase)).toMatchObject({ passed: true });
    });
  }

  it("passes every critical case and at least 95% overall", () => {
    const outcomes = evalCases.map(gradeEvalCase);
    expect(
      outcomes.filter((item) => item.critical).every((item) => item.passed),
    ).toBe(true);
    expect(
      outcomes.filter((item) => item.passed).length / outcomes.length,
    ).toBeGreaterThanOrEqual(0.95);
  });
});
