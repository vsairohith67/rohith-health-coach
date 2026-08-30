import {
  narrativeResponseSchema,
  type NarrativeResponse,
  type ResultEnvelope,
} from "@rohith-health/agent-contracts";
import { staticUrgentGuidance } from "@rohith-health/coach";

const diagnosisPatterns = [
  /\byou (?:have|suffer from|are diagnosed with)\b/i,
  /\bthis (?:proves|confirms|diagnoses)\b/i,
  /\b(?:insomnia|sleep apnea|arrhythmia|hypertension|depression|anxiety disorder)\b/i,
];
const medicationPatterns = [
  /\b(?:start|stop|skip|replace|increase|decrease|double|change|reschedule)\b.{0,40}\b(?:dose|dosage|medication|medicine|tablet|prescription)\b/i,
  /\btake an? (?:extra|additional) dose\b/i,
];
const unsupportedMetricPatterns = [
  /body battery/i,
  /training readiness/i,
  /garmin stress/i,
  /hrv status/i,
  /pulse ox/i,
];
const unsafeMarkupPattern = /<\/?(?:script|iframe|object|embed)|javascript:/i;

export function sanitizeUntrustedText(text: string, maxLength = 500): string {
  const withoutControls = [...text]
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 31 || code === 9 || code === 10 || code === 13;
    })
    .join("");
  return withoutControls
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/javascript\s*:/gi, "blocked-scheme:")
    .replace(/[<>]/g, (value) => (value === "<" ? "&lt;" : "&gt;"))
    .slice(0, maxLength);
}

export function validateNarrative(
  candidate: unknown,
  source: ResultEnvelope,
): { ok: true; value: NarrativeResponse } | { ok: false; reasons: string[] } {
  const parsed = narrativeResponseSchema.safeParse(candidate);
  if (!parsed.success) return { ok: false, reasons: ["SCHEMA_INVALID"] };
  const response = parsed.data;
  const text = [
    response.headline,
    response.summary,
    ...response.observations.map((item) => item.text),
    ...response.actions.flatMap((item) => [item.text, item.reason]),
  ].join(" ");
  const evidence = new Set(source.evidence.map((item) => item.id));
  const referenced = response.observations
    .flatMap((item) => item.evidence_ids)
    .concat(response.actions.flatMap((item) => item.evidence_ids));
  const reasons: string[] = [];
  if (referenced.some((id) => !evidence.has(id)))
    reasons.push("UNSUPPORTED_EVIDENCE");
  if (diagnosisPatterns.some((pattern) => pattern.test(text)))
    reasons.push("DIAGNOSIS_BLOCKED");
  if (medicationPatterns.some((pattern) => pattern.test(text)))
    reasons.push("MEDICATION_ADVICE_BLOCKED");
  if (unsupportedMetricPatterns.some((pattern) => pattern.test(text)))
    reasons.push("UNSUPPORTED_METRIC");
  if (unsafeMarkupPattern.test(text)) reasons.push("UNSAFE_MARKUP");
  if (response.actions.length > 3) reasons.push("TOO_MANY_ACTIONS");
  return reasons.length > 0
    ? { ok: false, reasons }
    : { ok: true, value: response };
}

export function routeUrgentSafety(text: string): {
  urgent: boolean;
  guidance: string | null;
} {
  const guidance = staticUrgentGuidance(text);
  return { urgent: guidance !== null, guidance };
}

export function assertAllowedTool(tool: string): void {
  if (!/^health_(?:get|list|compare|explain)_/.test(tool))
    throw new Error("TOOL_NOT_ALLOWED");
  if (/write|delete|update|create|sql|query|raw|admin|execute/i.test(tool))
    throw new Error("TOOL_NOT_ALLOWED");
}

export function deterministicFallback(
  source: ResultEnvelope,
): NarrativeResponse {
  const first = source.findings[0];
  return {
    schema_version: "1.0",
    headline:
      first?.headline ??
      "There is not enough information for a stronger summary",
    summary: first
      ? `${first.headline}. Review the evidence and current data completeness before acting.`
      : "No supported aggregate finding is available for this period.",
    observations: first
      ? [{ text: first.headline, evidence_ids: first.evidenceIds }]
      : [],
    actions: source.findings
      .flatMap((finding) =>
        finding.action
          ? [
              {
                text: finding.action,
                reason: "Based on the deterministic finding.",
                evidence_ids: finding.evidenceIds,
              },
            ]
          : [],
      )
      .slice(0, 3),
    confidence: first?.confidence ?? "low",
    limitations: source.limitations,
    safety_classification: "informational",
  };
}
