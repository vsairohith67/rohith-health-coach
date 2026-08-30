import { describe, expect, it } from "vitest";

import { generateDemoProfile } from "@rohith-health/domain";
import { resultEnvelopeSchema } from "@rohith-health/agent-contracts";
import {
  HealthQueryService,
  InMemoryHealthRepository,
  type AuthorizationContext,
  type HealthScope,
} from "@rohith-health/query";
import {
  assertAllowedTool,
  routeUrgentSafety,
  sanitizeUntrustedText,
  validateNarrative,
} from "./index";

const scopes = new Set<HealthScope>(["health.summary.read"]);
const auth: AuthorizationContext = {
  subject: "demo-user",
  scopes,
  expiresAt: Date.parse("2027-01-01"),
  revoked: false,
  timezone: "Asia/Kolkata",
  expandedRange: false,
};

describe("AI safety", () => {
  it("blocks write, raw, database and arbitrary tools", () => {
    for (const tool of [
      "health_update_health_data",
      "execute_sql",
      "health_get_raw_fit",
      "fetch_url",
      "health_delete_report",
    ]) {
      expect(() => assertAllowedTool(tool)).toThrow("TOOL_NOT_ALLOWED");
    }
    expect(() => assertAllowedTool("health_get_today_summary")).not.toThrow();
  });

  it("sanitizes script markup and bidirectional controls", () => {
    const result = sanitizeUntrustedText("\u202E<script>steal()</script>");
    expect(result).not.toContain("\u202E");
    expect(result).not.toContain("<script>");
  });

  it("routes urgent safety deterministically", () => {
    expect(routeUrgentSafety("I have chest pain")).toMatchObject({
      urgent: true,
    });
  });

  it("rejects diagnosis, medication advice, unsupported metrics and false evidence", async () => {
    const service = new HealthQueryService(
      new InMemoryHealthRepository(generateDemoProfile().days),
      () => new Date("2026-08-28T12:00:00Z"),
    );
    const source = resultEnvelopeSchema.parse(
      await service.execute("getTodaySummary", {}, auth),
    );
    const base = {
      schema_version: "1.0",
      headline: "Summary",
      observations: [],
      actions: [],
      confidence: "low",
      limitations: ["Wearable information is limited."],
      safety_classification: "informational",
    } as const;
    expect(
      validateNarrative({ ...base, summary: "You have sleep apnea." }, source)
        .ok,
    ).toBe(false);
    expect(
      validateNarrative(
        { ...base, summary: "Increase your medication dose." },
        source,
      ).ok,
    ).toBe(false);
    expect(
      validateNarrative(
        { ...base, summary: "Your Garmin Body Battery is low." },
        source,
      ).ok,
    ).toBe(false);
    expect(
      validateNarrative(
        {
          ...base,
          summary: "Review available evidence.",
          observations: [{ text: "Unsupported", evidence_ids: ["invented"] }],
        },
        source,
      ).ok,
    ).toBe(false);
  });
});
