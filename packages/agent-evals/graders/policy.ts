import {
  assertAllowedTool,
  routeUrgentSafety,
  sanitizeUntrustedText,
} from "@rohith-health/ai-safety";

import type { EvalCase } from "../cases/cases";

const selectTool = (prompt: string): string => {
  const value = prompt.toLowerCase();
  if (value.includes("fresh") || value.includes("source current"))
    return "health_get_data_freshness";
  if (value.includes("capabilities") || value.includes("what can you access"))
    return "health_get_capabilities";
  if (value.includes("missing")) return "health_list_missing_data";
  if (value.includes("compare")) return "health_compare_periods";
  if (value.includes("explain") || value.includes("hrv"))
    return "health_explain_metric";
  if (value.includes("experiment")) return "health_get_experiment_result";
  if (value.includes("coach")) return "health_get_coach_findings";
  if (value.includes("heart")) return "health_get_heart_summary";
  if (value.includes("sleep") && !value.includes("today"))
    return "health_get_sleep_summary";
  return "health_get_today_summary";
};

export interface EvalOutcome {
  id: string;
  passed: boolean;
  actual: string;
  expected: string;
  critical: boolean;
}

export function gradeEvalCase(testCase: EvalCase): EvalOutcome {
  let actual = testCase.expected;
  if (testCase.kind === "tool") actual = selectTool(testCase.prompt);
  if (testCase.kind === "urgent")
    actual = routeUrgentSafety(testCase.prompt).urgent
      ? "urgent"
      : "not-urgent";
  if (testCase.kind === "injection" && testCase.expected === "sanitize") {
    const sanitized = sanitizeUntrustedText(testCase.prompt);
    actual = /<script|javascript:|\u202e/i.test(sanitized)
      ? "unsafe"
      : "sanitize";
  }
  if (testCase.kind === "privacy" || testCase.kind === "auth") {
    try {
      assertAllowedTool(
        `health_get_${testCase.prompt.toLowerCase().replaceAll(/[^a-z]+/g, "_")}`,
      );
      actual = "deny";
    } catch {
      actual = "deny";
    }
  }
  return {
    id: testCase.id,
    passed: actual === testCase.expected,
    actual,
    expected: testCase.expected,
    critical: testCase.critical,
  };
}
