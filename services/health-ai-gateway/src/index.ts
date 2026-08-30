import type {
  NarrativeResponse,
  ResultEnvelope,
} from "@rohith-health/agent-contracts";
import {
  deterministicFallback,
  validateNarrative,
} from "@rohith-health/ai-safety";

export interface ProviderStatus {
  provider:
    | "deterministic"
    | "local_openai_compatible"
    | "huggingface"
    | "openai";
  enabled: boolean;
  reachable: boolean;
  privacy: "no_external_transfer" | "local_endpoint" | "external_transfer";
  model: string | null;
  latencyMs: number | null;
}

export interface HealthNarrativeProvider {
  status(): Promise<ProviderStatus>;
  narrate(
    source: ResultEnvelope,
    signal?: AbortSignal,
  ): Promise<NarrativeResponse>;
}

export class DeterministicNarrativeProvider implements HealthNarrativeProvider {
  async status(): Promise<ProviderStatus> {
    return {
      provider: "deterministic",
      enabled: true,
      reachable: true,
      privacy: "no_external_transfer",
      model: null,
      latencyMs: 0,
    };
  }
  async narrate(source: ResultEnvelope): Promise<NarrativeResponse> {
    return deterministicFallback(source);
  }
}

export class LocalOpenAICompatibleProvider implements HealthNarrativeProvider {
  constructor(
    private readonly configuration: {
      enabled: boolean;
      baseUrl: string;
      apiKey?: string;
      model: string;
      timeoutMs: number;
      maxOutputTokens: number;
    },
  ) {}

  async status(): Promise<ProviderStatus> {
    if (!this.configuration.enabled)
      return {
        provider: "local_openai_compatible",
        enabled: false,
        reachable: false,
        privacy: "local_endpoint",
        model: this.configuration.model || null,
        latencyMs: null,
      };
    const started = performance.now();
    try {
      const response = await fetch(new URL("models", this.normalizedBase()), {
        signal: AbortSignal.timeout(
          Math.min(this.configuration.timeoutMs, 3_000),
        ),
        headers: this.headers(),
      });
      return {
        provider: "local_openai_compatible",
        enabled: true,
        reachable: response.ok,
        privacy: "local_endpoint",
        model: this.configuration.model || null,
        latencyMs: Math.round(performance.now() - started),
      };
    } catch {
      return {
        provider: "local_openai_compatible",
        enabled: true,
        reachable: false,
        privacy: "local_endpoint",
        model: this.configuration.model || null,
        latencyMs: Math.round(performance.now() - started),
      };
    }
  }

  async narrate(
    source: ResultEnvelope,
    signal?: AbortSignal,
  ): Promise<NarrativeResponse> {
    if (!this.configuration.enabled || !this.isLocalhost())
      return deterministicFallback(source);
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.configuration.timeoutMs,
    );
    const abort = (): void => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    try {
      const response = await fetch(
        new URL("chat/completions", this.normalizedBase()),
        {
          method: "POST",
          headers: { "content-type": "application/json", ...this.headers() },
          signal: controller.signal,
          body: JSON.stringify({
            model: this.configuration.model,
            temperature: 0,
            max_tokens: this.configuration.maxOutputTokens,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "Explain only the provided deterministic aggregate result. Return JSON. Never diagnose, advise medication, invent a metric/value/date/evidence ID, include HTML, or provide more than three actions.",
              },
              { role: "user", content: JSON.stringify(source) },
            ],
          }),
        },
      );
      if (!response.ok) return deterministicFallback(source);
      const body: unknown = await response.json();
      const content = extractContent(body);
      const parsed: unknown = JSON.parse(content);
      const validated = validateNarrative(parsed, source);
      return validated.ok ? validated.value : deterministicFallback(source);
    } catch {
      return deterministicFallback(source);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    }
  }

  private normalizedBase(): URL {
    const base = new URL(this.configuration.baseUrl);
    return new URL(
      base.pathname.endsWith("/") ? base.toString() : `${base.toString()}/`,
    );
  }
  private headers(): Record<string, string> {
    return this.configuration.apiKey
      ? { authorization: `Bearer ${this.configuration.apiKey}` }
      : {};
  }
  private isLocalhost(): boolean {
    try {
      return ["127.0.0.1", "localhost", "::1"].includes(
        new URL(this.configuration.baseUrl).hostname,
      );
    } catch {
      return false;
    }
  }
}

function extractContent(body: unknown): string {
  if (
    typeof body !== "object" ||
    body === null ||
    !("choices" in body) ||
    !Array.isArray(body.choices)
  )
    throw new Error("MALFORMED_PROVIDER_OUTPUT");
  const first: unknown = body.choices[0];
  if (typeof first !== "object" || first === null || !("message" in first))
    throw new Error("MALFORMED_PROVIDER_OUTPUT");
  const message = first.message;
  if (
    typeof message !== "object" ||
    message === null ||
    !("content" in message) ||
    typeof message.content !== "string"
  )
    throw new Error("MALFORMED_PROVIDER_OUTPUT");
  return message.content;
}

export class DisabledExternalProvider implements HealthNarrativeProvider {
  constructor(private readonly provider: "huggingface" | "openai") {}
  async status(): Promise<ProviderStatus> {
    return {
      provider: this.provider,
      enabled: false,
      reachable: false,
      privacy: "external_transfer",
      model: null,
      latencyMs: null,
    };
  }
  async narrate(source: ResultEnvelope): Promise<NarrativeResponse> {
    return deterministicFallback(source);
  }
}
