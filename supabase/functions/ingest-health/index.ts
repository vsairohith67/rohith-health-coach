import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { z } from "npm:zod@4.5.4";

import { jsonResponse, safeError } from "../_shared/http.ts";

const MAX_PAYLOAD_BYTES = Number(
  Deno.env.get("INGEST_MAX_PAYLOAD_BYTES") ?? 2_000_000,
);
const MAX_SAMPLE_COUNT = Number(
  Deno.env.get("INGEST_MAX_SAMPLE_COUNT") ?? 2_000,
);
const METRICS = [
  "sleep_analysis",
  "steps",
  "active_energy",
  "resting_energy",
  "walking_running_distance",
  "workout",
  "heart_rate",
  "resting_heart_rate",
  "hrv_sdnn",
  "body_mass",
  "body_fat_percentage",
  "water",
] as const;

const isoTimestamp = z.iso.datetime({ offset: true });
const sampleSchema = z
  .object({
    metric_type: z.enum(METRICS),
    start_at: isoTimestamp,
    end_at: isoTimestamp,
    numeric_value: z.number().finite().min(-100_000).max(10_000_000).nullable(),
    text_value: z.string().max(500).nullable(),
    category_value: z.string().max(80).nullable(),
    unit: z.string().max(40).nullable(),
    source_name: z.string().min(1).max(120),
    source_bundle: z.string().max(200).nullable(),
    source_record_id: z.string().max(300).nullable(),
    metadata: z.record(z.string(), z.unknown()),
  })
  .strict()
  .superRefine((sample, context) => {
    if (Date.parse(sample.end_at) < Date.parse(sample.start_at)) {
      context.addIssue({ code: "custom", message: "end_before_start" });
    }
  });

const envelopeSchema = z
  .object({
    schema_version: z.literal("1.0"),
    export_id: z.uuid(),
    exported_at: isoTimestamp,
    timezone: z.string().min(1).max(80),
    device: z
      .object({
        device_id: z.string().min(1).max(120),
        device_name: z.string().min(1).max(120),
        source: z.literal("apple_shortcut"),
        shortcut_version: z.string().min(1).max(40),
      })
      .strict(),
    window: z.object({ start: isoTimestamp, end: isoTimestamp }).strict(),
    samples: z.array(sampleSchema).max(MAX_SAMPLE_COUNT),
  })
  .strict()
  .superRefine((envelope, context) => {
    if (Date.parse(envelope.window.end) <= Date.parse(envelope.window.start)) {
      context.addIssue({ code: "custom", message: "invalid_window" });
    }
  });

const normalizeUnit = (
  metric: (typeof METRICS)[number],
  unit: string | null,
): string | null => {
  const normalized = unit?.trim().toLowerCase() ?? null;
  const allowlist: Record<string, readonly string[]> = {
    sleep_analysis: [],
    steps: ["count"],
    active_energy: ["kcal", "kj"],
    resting_energy: ["kcal", "kj"],
    walking_running_distance: ["m", "km", "mi"],
    workout: ["min", "s"],
    heart_rate: ["count/min", "bpm"],
    resting_heart_rate: ["count/min", "bpm"],
    hrv_sdnn: ["ms"],
    body_mass: ["kg", "lb"],
    body_fat_percentage: ["%"],
    water: ["ml", "l", "fl_oz_us"],
  };
  return normalized && allowlist[metric]?.includes(normalized)
    ? normalized
    : unit;
};

const sha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

Deno.serve(async (request) => {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const startedAt = performance.now();
  if (request.method !== "POST")
    return safeError(405, "method_not_allowed", requestId);
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return safeError(415, "content_type_required", requestId);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_PAYLOAD_BYTES)
    return safeError(413, "payload_too_large", requestId);
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_PAYLOAD_BYTES) {
    return safeError(413, "payload_too_large", requestId);
  }

  const bearer = request.headers
    .get("authorization")
    ?.match(/^Bearer ([A-Za-z0-9_-]{32,})$/)?.[1];
  const deviceId = request.headers.get("x-device-id");
  const idempotencyKey = request.headers.get("x-idempotency-key");
  if (!bearer || !deviceId || !idempotencyKey || idempotencyKey.length > 200) {
    return safeError(401, "invalid_ingestion_credentials", requestId);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey)
    return safeError(503, "service_not_configured", requestId);
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return safeError(400, "invalid_json", requestId);
  }
  const parsed = envelopeSchema.safeParse(parsedJson);
  if (!parsed.success)
    return safeError(422, "invalid_health_envelope", requestId);

  const { data: credentialRows, error: credentialError } = await admin.rpc(
    "service_resolve_ingestion_credential",
    { p_token: bearer, p_device_id: deviceId },
  );
  const credential = credentialRows?.[0];
  if (credentialError || !credential)
    return safeError(401, "invalid_ingestion_credentials", requestId);

  const { data: existing } = await admin
    .from("ingestion_events")
    .select(
      "id, inserted_count, duplicate_count, rejected_count, conflict_count",
    )
    .eq("user_id", credential.user_id)
    .eq("device_id", credential.device_id)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (existing) {
    return jsonResponse(200, {
      ok: true,
      request_id: requestId,
      ingestion_event_id: existing.id,
      received: parsed.data.samples.length,
      inserted: existing.inserted_count,
      duplicates: existing.duplicate_count,
      rejected: existing.rejected_count,
      conflicts: existing.conflict_count,
      affected_dates: [],
      replayed: true,
    });
  }

  const { data: event, error: eventError } = await admin
    .from("ingestion_events")
    .insert({
      user_id: credential.user_id,
      device_id: credential.device_id,
      provider_type: "apple_shortcut",
      request_id: requestId,
      idempotency_key: idempotencyKey,
      schema_version: parsed.data.schema_version,
      received_at: new Date().toISOString(),
      exported_at: parsed.data.exported_at,
      window_start: parsed.data.window.start,
      window_end: parsed.data.window.end,
      sample_count: parsed.data.samples.length,
      status: "processing",
    })
    .select("id")
    .single();
  if (eventError || !event)
    return safeError(409, "ingestion_event_conflict", requestId);

  const prepared = await Promise.all(
    parsed.data.samples.map(async (sample) => {
      const originalUnit = sample.unit;
      const sourceHash = await sha256(
        sample.source_record_id ??
          [
            sample.metric_type,
            sample.start_at,
            sample.end_at,
            sample.numeric_value,
            sample.category_value,
            sample.source_name,
          ].join("|"),
      );
      return {
        user_id: credential.user_id,
        device_id: credential.device_id,
        ingestion_event_id: event.id,
        metric_type: sample.metric_type,
        start_at: sample.start_at,
        end_at: sample.end_at,
        numeric_value: sample.numeric_value,
        text_value: sample.text_value,
        category_value: sample.category_value,
        unit: normalizeUnit(sample.metric_type, sample.unit),
        source_name: sample.source_name,
        source_bundle: sample.source_bundle,
        source_record_id: sample.source_record_id,
        source_hash: sourceHash,
        metadata: { ...sample.metadata, original_unit: originalUnit },
      };
    }),
  );

  const { data: insertedRows, error: insertError } = await admin
    .from("raw_health_samples")
    .upsert(prepared, {
      onConflict: "user_id,source_hash",
      ignoreDuplicates: true,
    })
    .select("id,start_at");
  if (insertError) {
    await admin
      .from("ingestion_events")
      .update({ status: "failed", error_code: "sample_insert_failed" })
      .eq("id", event.id);
    return safeError(500, "ingestion_failed", requestId);
  }

  const inserted = insertedRows?.length ?? 0;
  const duplicates = prepared.length - inserted;
  const affectedDates = [
    ...new Set((insertedRows ?? []).map((row) => row.start_at.slice(0, 10))),
  ].sort();
  await admin
    .from("ingestion_events")
    .update({
      status: "completed",
      inserted_count: inserted,
      duplicate_count: duplicates,
      processing_duration_ms: Math.round(performance.now() - startedAt),
    })
    .eq("id", event.id);
  await admin.rpc("service_mark_credential_used", {
    p_credential_id: credential.credential_id,
  });

  console.warn(
    JSON.stringify({
      event: "health_ingested",
      request_id: requestId,
      inserted,
      duplicates,
    }),
  );
  return jsonResponse(200, {
    ok: true,
    request_id: requestId,
    ingestion_event_id: event.id,
    received: prepared.length,
    inserted,
    duplicates,
    rejected: 0,
    conflicts: 0,
    affected_dates: affectedDates,
  });
});
