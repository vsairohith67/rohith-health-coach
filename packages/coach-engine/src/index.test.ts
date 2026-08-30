import { describe, expect, it } from "vitest";

import { generateDemoProfile } from "@rohith-health/domain";
import { generateCoachFindings, staticUrgentGuidance } from "./index";

describe("coach engine", () => {
  it("returns evidence-backed findings with no more than three actions", () => {
    const findings = generateCoachFindings(generateDemoProfile().days);
    expect(
      findings.filter((finding) => finding.action !== null).length,
    ).toBeLessThanOrEqual(3);
    expect(findings.every((finding) => finding.limitations.length > 0)).toBe(
      true,
    );
  });

  it.each([
    "chest pain",
    "cannot breathe",
    "I fainted",
    "slurred speech",
    "immediate suicide intent",
  ])("routes urgent phrase: %s", (text) =>
    expect(staticUrgentGuidance(text)).toContain("emergency services"),
  );

  it("does not escalate an ordinary informational question", () => {
    expect(
      staticUrgentGuidance("How many steps did I take yesterday?"),
    ).toBeNull();
  });
});
