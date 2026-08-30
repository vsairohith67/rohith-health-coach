import { describe, expect, it } from "vitest";

import { generateDemoProfile } from "@rohith-health/domain";
import { resultEnvelopeSchema } from "@rohith-health/agent-contracts";
import {
  HealthQueryService,
  InMemoryHealthRepository,
  QueryServiceError,
  type AuthorizationContext,
  type HealthScope,
} from "./index";

const allScopes = new Set<HealthScope>([
  "health.freshness.read",
  "health.summary.read",
  "health.sleep.read",
  "health.activity.read",
  "health.heart.read",
  "health.baseline.read",
  "health.coach.read",
  "health.reports.read",
  "health.wellbeing.read",
]);
const auth = (
  overrides: Partial<AuthorizationContext> = {},
): AuthorizationContext => ({
  subject: "demo-user",
  scopes: allScopes,
  expiresAt: Date.parse("2026-09-01T00:00:00Z"),
  revoked: false,
  timezone: "Asia/Kolkata",
  expandedRange: false,
  ...overrides,
});

describe("controlled health query service", () => {
  const profile = generateDemoProfile();
  const service = new HealthQueryService(
    new InMemoryHealthRepository(profile.days),
    () => new Date("2026-08-28T12:00:00Z"),
  );

  it("derives ownership from auth and does not accept a user id in input", async () => {
    const result = await service.execute(
      "getTodaySummary",
      {},
      auth({ subject: "other-user" }),
    );
    expect("metrics" in result && result.metrics).toHaveLength(0);
  });

  it("denies missing scope, expired, and revoked authorization", async () => {
    await expect(
      service.execute("getSleepSummary", {}, auth({ scopes: new Set() })),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      service.execute("getSleepSummary", {}, auth({ expiresAt: 0 })),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      service.execute("getSleepSummary", {}, auth({ revoked: true })),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("enforces ordinary and expanded range limits", async () => {
    await expect(
      service.execute(
        "getSleepTrends",
        { dateRange: { start: "2026-01-01", end: "2026-08-28" } },
        auth(),
      ),
    ).rejects.toBeInstanceOf(QueryServiceError);
    await expect(
      service.execute(
        "getSleepTrends",
        { dateRange: { start: "2026-01-01", end: "2026-08-28" } },
        auth({ expandedRange: true }),
      ),
    ).resolves.toMatchObject({ schemaVersion: "1.0" });
  });

  it("includes timezone, freshness, completeness, evidence and limitations", async () => {
    const result = resultEnvelopeSchema.parse(
      await service.execute("getSleepSummary", {}, auth()),
    );
    expect(result).toMatchObject({
      schemaVersion: "1.0",
      userTimezone: "Asia/Kolkata",
    });
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.limitations.length).toBeGreaterThan(0);
  });
});
