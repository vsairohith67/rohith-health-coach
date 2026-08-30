import { createServer, type Server } from "node:http";
import {
  resultEnvelopeSchema,
  type NarrativeResponse,
} from "@rohith-health/agent-contracts";
import { generateDemoProfile } from "@rohith-health/domain";
import {
  HealthQueryService,
  InMemoryHealthRepository,
  type AuthorizationContext,
  type HealthScope,
} from "@rohith-health/query";
import { afterEach, describe, expect, it } from "vitest";

import {
  DeterministicNarrativeProvider,
  DisabledExternalProvider,
  LocalOpenAICompatibleProvider,
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

const sourceResult = async () => {
  const service = new HealthQueryService(
    new InMemoryHealthRepository(generateDemoProfile().days),
    () => new Date("2026-08-28T12:00:00Z"),
  );
  return resultEnvelopeSchema.parse(
    await service.execute("getTodaySummary", {}, auth),
  );
};

const safeNarrative = (evidenceId: string): NarrativeResponse => ({
  schema_version: "1.0",
  headline: "Aggregate pattern",
  summary: "The supported aggregate is available for the resolved period.",
  observations: [
    { text: "The aggregate is present.", evidence_ids: [evidenceId] },
  ],
  actions: [],
  confidence: "low",
  limitations: ["Wearable aggregates have measurement limitations."],
  safety_classification: "informational",
});

describe("provider-neutral AI gateway", () => {
  let server: Server | undefined;
  afterEach(() => server?.close());

  it("keeps deterministic and external providers safe by default", async () => {
    const source = await sourceResult();
    expect(
      (await new DeterministicNarrativeProvider().narrate(source)).actions
        .length,
    ).toBeLessThanOrEqual(3);
    for (const providerName of ["openai", "huggingface"] as const) {
      const provider = new DisabledExternalProvider(providerName);
      expect(await provider.status()).toMatchObject({
        enabled: false,
        reachable: false,
        privacy: "external_transfer",
      });
      expect(await provider.narrate(source)).toMatchObject({
        schema_version: "1.0",
      });
    }
  });

  it("refuses a non-loopback local endpoint without making a request", async () => {
    const source = await sourceResult();
    const provider = new LocalOpenAICompatibleProvider({
      enabled: true,
      baseUrl: "https://example.invalid/v1",
      model: "synthetic-model",
      timeoutMs: 50,
      maxOutputTokens: 100,
    });
    expect(await provider.narrate(source)).toEqual(
      await new DeterministicNarrativeProvider().narrate(source),
    );
  });

  it("accepts valid evidence-bound JSON and falls back on malformed or unsafe output", async () => {
    const source = await sourceResult();
    const evidenceId = source.evidence[0]?.id;
    if (!evidenceId) throw new Error("synthetic_evidence_missing");
    let mode: "valid" | "malformed" | "unsafe" = "valid";
    server = createServer((request, response) => {
      if (request.url === "/v1/models") {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify({ data: [{ id: "synthetic-model" }] }));
        return;
      }
      response.writeHead(200, { "content-type": "application/json" });
      const content =
        mode === "malformed"
          ? "not json"
          : JSON.stringify(
              mode === "unsafe"
                ? {
                    ...safeNarrative(evidenceId),
                    summary: "You have sleep apnea.",
                  }
                : safeNarrative(evidenceId),
            );
      response.end(JSON.stringify({ choices: [{ message: { content } }] }));
    });
    await new Promise<void>((resolve) =>
      server?.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("test_server_unavailable");
    const provider = new LocalOpenAICompatibleProvider({
      enabled: true,
      baseUrl: `http://127.0.0.1:${address.port}/v1`,
      model: "synthetic-model",
      timeoutMs: 1_000,
      maxOutputTokens: 200,
    });

    expect(await provider.status()).toMatchObject({
      enabled: true,
      reachable: true,
      privacy: "local_endpoint",
    });
    expect(await provider.narrate(source)).toMatchObject({
      headline: "Aggregate pattern",
    });
    mode = "malformed";
    expect(await provider.narrate(source)).toEqual(
      await new DeterministicNarrativeProvider().narrate(source),
    );
    mode = "unsafe";
    expect(await provider.narrate(source)).toEqual(
      await new DeterministicNarrativeProvider().narrate(source),
    );
  });
});
