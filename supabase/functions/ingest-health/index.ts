import {
  createClient,
  type SupabaseClient,
} from "npm:@supabase/supabase-js@2.112.4";
import { z } from "npm:zod@4.5.4";

import { jsonResponse, safeError } from "../_shared/http.ts";
import {
  arbitrateMetric,
  classifySource,
  type MetricObservation,
} from "../_shared/source-arbitration.ts";

const MAX_PAYLOAD_BYTES = Number(
  Deno.env.get("INGEST_MAX_PAYLOAD_BYTES") ?? 500_000,
);
const MAX_SAMPLE_COUNT = Number(
  Deno.env.get("INGEST_MAX_SAMPLE_COUNT") ?? 2_000,
);
const MAX_HISTORY_DAYS = Number(Deno.env.get("INGEST_MAX_HISTORY_DAYS") ?? 90);
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

const UNIT_ALLOWLIST: Record<(typeof METRICS)[number], readonly string[]> = {
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
    source_provider: z.string().min(1).max(120).nullable().optional(),
    source_device: z
      .object({
        name: z.string().max(120).nullable(),
        manufacturer: z.string().max(120).nullable(),
        model: z.string().max(120).nullable(),
        local_identifier: z.string().max(200).nullable(),
      })
      .strict()
      .nullable()
      .optional(),
    aggregation: z
      .enum(["daily_total", "interval_delta", "session_total", "point_summary"])
      .optional(),
    coverage: z
      .object({
        state: z.enum(["complete", "partial", "unknown"]),
        current_day: z.boolean(),
        fallback_gap_confirmed: z.boolean(),
      })
      .strict()
      .optional(),
    metadata: z.record(z.string(), z.unknown()),
  })
  .strict()
  .superRefine((sample, context) => {
    if (Date.parse(sample.end_at) < Date.parse(sample.start_at)) {
      context.addIssue({ code: "custom", message: "end_before_start" });
    }
    const normalizedUnit = sample.unit?.trim().toLowerCase() ?? null;
    const allowedUnits = UNIT_ALLOWLIST[sample.metric_type];
    if (
      (allowedUnits.length === 0 && normalizedUnit !== null) ||
      (allowedUnits.length > 0 &&
        (normalizedUnit === null || !allowedUnits.includes(normalizedUnit)))
    ) {
      context.addIssue({ code: "custom", message: "unsupported_unit" });
    }
    if (
      sample.numeric_value === null &&
      sample.text_value === null &&
      sample.category_value === null
    ) {
      context.addIssue({ code: "custom", message: "sample_value_required" });
    }
    if (sample.numeric_value !== null && sample.numeric_value < 0) {
      context.addIssue({ code: "custom", message: "invalid_metric_value" });
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
    if (
      Date.parse(envelope.window.end) - Date.parse(envelope.window.start) >
      MAX_HISTORY_DAYS * 86_400_000
    ) {
      context.addIssue({
        code: "custom",
        message: "historical_window_too_large",
      });
    }
  });

const normalizeUnit = (
  metric: (typeof METRICS)[number],
  unit: string | null,
): string | null => {
  const normalized = unit?.trim().toLowerCase() ?? null;
  return normalized && UNIT_ALLOWLIST[metric].includes(normalized)
    ? normalized
    : null;
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

const localDateFor = (timestamp: string, timezone: string): string => {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) throw new Error("invalid_timezone");
  return `${year}-${month}-${day}`;
};

const isValidTimezone = (timezone: string): boolean => {
  try {
    localDateFor(new Date().toISOString(), timezone);
    return true;
  } catch {
    return false;
  }
};

interface RawStepRow {
  id: string;
  device_id: string | null;
  start_at: string;
  end_at: string;
  numeric_value: number | null;
  unit: string | null;
  source_name: string;
  source_bundle: string | null;
  source_record_id: string | null;
  source_hash: string;
  metadata: Record<string, unknown> | null;
}

const metadataObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const metadataString = (
  metadata: Record<string, unknown>,
  key: string,
): string | null =>
  typeof metadata[key] === "string" ? (metadata[key] as string) : null;

const recomputeDailySteps = async (
  admin: SupabaseClient,
  userId: string,
  timezone: string,
  affectedDates: readonly string[],
): Promise<{ conflicts: number; error: string | null }> => {
  let conflicts = 0;
  for (const localDate of affectedDates) {
    const dayStart = new Date(`${localDate}T00:00:00.000Z`);
    const queryStart = new Date(dayStart.getTime() - 86_400_000).toISOString();
    const queryEnd = new Date(dayStart.getTime() + 172_800_000).toISOString();
    const { data, error } = await admin
      .from("raw_health_samples")
      .select(
        "id,device_id,start_at,end_at,numeric_value,unit,source_name,source_bundle,source_record_id,source_hash,metadata",
      )
      .eq("user_id", userId)
      .eq("metric_type", "steps")
      .gte("start_at", queryStart)
      .lt("start_at", queryEnd)
      .limit(MAX_SAMPLE_COUNT * 3);
    if (error) return { conflicts, error: "step_source_query_failed" };

    const rows = (data ?? []) as RawStepRow[];
    const observations: MetricObservation[] = rows
      .filter(
        (row) =>
          row.numeric_value !== null &&
          localDateFor(row.start_at, timezone) === localDate,
      )
      .map((row) => {
        const metadata = metadataObject(row.metadata);
        const sourceDevice = metadataObject(metadata.source_device);
        const coverage = metadataObject(metadata.coverage);
        const sourceProvider = metadataString(metadata, "source_provider");
        const aggregation = metadataString(metadata, "aggregation");
        const coverageState = metadataString(coverage, "state");
        const sourceKind = classifySource({
          provider: sourceProvider,
          sourceName: row.source_name,
          sourceBundle: row.source_bundle,
          deviceName: metadataString(sourceDevice, "name"),
          deviceManufacturer: metadataString(sourceDevice, "manufacturer"),
          deviceModel: metadataString(sourceDevice, "model"),
        });
        return {
          id: row.id,
          metric: "steps",
          value: row.numeric_value ?? Number.NaN,
          unit: row.unit ?? "",
          startAt: row.start_at,
          endAt: row.end_at,
          sourceKind,
          provenance: {
            provider: sourceProvider ?? "apple_health",
            sourceName: row.source_name,
            sourceBundle: row.source_bundle,
            deviceId: row.device_id,
            sourceRecordId: row.source_record_id,
            sourceHash: row.source_hash,
            importChannel: "apple_health",
          },
          aggregation:
            aggregation === "interval_delta" ||
            aggregation === "session_total" ||
            aggregation === "point_summary"
              ? aggregation
              : "daily_total",
          coverage:
            coverageState === "complete" || coverageState === "partial"
              ? coverageState
              : "unknown",
          currentDay:
            localDateFor(new Date().toISOString(), timezone) === localDate ||
            coverage.current_day === true,
          fallbackGapConfirmed: coverage.fallback_gap_confirmed === true,
          valid: row.numeric_value !== null && row.numeric_value >= 0,
        };
      });
    if (observations.length === 0) continue;

    const decision = arbitrateMetric(observations);
    conflicts += decision.conflicts.length;
    const { data: existingMetric, error: existingError } = await admin
      .from("daily_metrics")
      .select("source_coverage")
      .eq("user_id", userId)
      .eq("local_date", localDate)
      .maybeSingle();
    if (existingError)
      return { conflicts, error: "daily_metric_lookup_failed" };
    const existingCoverage = metadataObject(existingMetric?.source_coverage);
    const selectedValue =
      decision.status === "conflict" || decision.status === "unavailable"
        ? null
        : Math.round(decision.value ?? 0);
    const completionStatus =
      decision.coverage === "complete" && decision.comparisonEligible
        ? "complete"
        : "partial";
    const completeness =
      selectedValue === null ? 0 : decision.coverage === "complete" ? 100 : 50;
    const { error: upsertError } = await admin.from("daily_metrics").upsert(
      {
        user_id: userId,
        local_date: localDate,
        timezone,
        day_completion_status: completionStatus,
        steps: selectedValue,
        data_completeness_percent: completeness,
        source_coverage: {
          ...existingCoverage,
          steps: decision,
        },
      },
      { onConflict: "user_id,local_date" },
    );
    if (upsertError) return { conflicts, error: "daily_metric_upsert_failed" };
  }
  return { conflicts, error: null };
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
  if (!parsed.success) {
    const issueMessages = parsed.error.issues.map((issue) => issue.message);
    const errorCode = issueMessages.includes("unsupported_unit")
      ? "unsupported_unit"
      : issueMessages.includes("historical_window_too_large")
        ? "historical_window_too_large"
        : "invalid_health_envelope";
    return safeError(422, errorCode, requestId);
  }
  if (!isValidTimezone(parsed.data.timezone))
    return safeError(422, "invalid_timezone", requestId);

  const { data: credentialRows, error: credentialError } = await admin.rpc(
    "service_resolve_ingestion_credential",
    { p_token: bearer, p_device_id: deviceId },
  );
  const credential = credentialRows?.[0];
  if (credentialError || !credential)
    return safeError(401, "invalid_ingestion_credentials", requestId);
  const { data: registeredDevice, error: registeredDeviceError } = await admin
    .from("devices")
    .select("external_device_id,user_id,revoked_at")
    .eq("id", credential.device_id)
    .eq("user_id", credential.user_id)
    .maybeSingle();
  if (
    registeredDeviceError ||
    !registeredDevice ||
    registeredDevice.revoked_at ||
    !registeredDevice.external_device_id ||
    registeredDevice.external_device_id !== parsed.data.device.device_id
  ) {
    return safeError(401, "invalid_ingestion_device", requestId);
  }

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
      updated: 0,
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
  if (eventError || !event) {
    const { data: racedEvent } = await admin
      .from("ingestion_events")
      .select(
        "id, inserted_count, duplicate_count, rejected_count, conflict_count",
      )
      .eq("user_id", credential.user_id)
      .eq("device_id", credential.device_id)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (racedEvent) {
      return jsonResponse(200, {
        ok: true,
        request_id: requestId,
        ingestion_event_id: racedEvent.id,
        received: parsed.data.samples.length,
        inserted: racedEvent.inserted_count,
        updated: 0,
        duplicates: racedEvent.duplicate_count,
        rejected: racedEvent.rejected_count,
        conflicts: racedEvent.conflict_count,
        affected_dates: [],
        replayed: true,
      });
    }
    return safeError(409, "ingestion_event_conflict", requestId);
  }

  const prepared = await Promise.all(
    parsed.data.samples.map(async (sample) => {
      const originalUnit = sample.unit;
      const sourceNamespace = [
        sample.metric_type,
        sample.source_provider ?? "unknown-provider",
        sample.source_bundle ?? sample.source_name,
        sample.source_device?.local_identifier ?? "unknown-source-device",
        credential.device_id,
      ];
      const sourceHash = await sha256(
        [
          ...sourceNamespace,
          sample.source_record_id ? "record" : "fingerprint",
          sample.source_record_id ?? sample.start_at,
          sample.source_record_id ? null : sample.end_at,
          sample.source_record_id ? null : sample.numeric_value,
          sample.source_record_id ? null : sample.text_value,
          sample.source_record_id ? null : sample.category_value,
          sample.source_record_id ? null : originalUnit,
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
        metadata: {
          ...sample.metadata,
          original_unit: originalUnit,
          source_provider: sample.source_provider ?? null,
          source_device: sample.source_device ?? null,
          aggregation: sample.aggregation ?? null,
          coverage: sample.coverage ?? null,
          import_channel: "apple_health",
        },
      };
    }),
  );

  const existingSamples = prepared.length
    ? await admin
        .from("raw_health_samples")
        .select(
          "source_hash,start_at,end_at,numeric_value,text_value,category_value,unit,source_name,source_bundle,source_record_id",
        )
        .eq("user_id", credential.user_id)
        .in(
          "source_hash",
          prepared.map((sample) => sample.source_hash),
        )
    : { data: [], error: null };
  if (existingSamples.error) {
    await admin.from("ingestion_events").delete().eq("id", event.id);
    return safeError(500, "sample_lookup_failed", requestId);
  }
  const existingByHash = new Map(
    (existingSamples.data ?? []).map((sample) => [sample.source_hash, sample]),
  );
  const sameCanonicalSample = (
    existingSample: Record<string, unknown>,
    preparedSample: (typeof prepared)[number],
  ): boolean =>
    typeof existingSample.start_at === "string" &&
    Date.parse(existingSample.start_at) ===
      Date.parse(preparedSample.start_at) &&
    typeof existingSample.end_at === "string" &&
    Date.parse(existingSample.end_at) === Date.parse(preparedSample.end_at) &&
    existingSample.numeric_value === preparedSample.numeric_value &&
    existingSample.text_value === preparedSample.text_value &&
    existingSample.category_value === preparedSample.category_value &&
    existingSample.unit === preparedSample.unit &&
    existingSample.source_name === preparedSample.source_name &&
    existingSample.source_bundle === preparedSample.source_bundle &&
    existingSample.source_record_id === preparedSample.source_record_id;
  const newSamples = prepared.filter(
    (sample) => !existingByHash.has(sample.source_hash),
  );
  const updatedSamples = prepared.filter((sample) => {
    const existingSample = existingByHash.get(sample.source_hash);
    return (
      existingSample !== undefined &&
      !sameCanonicalSample(existingSample, sample)
    );
  });
  const samplesToWrite = [...newSamples, ...updatedSamples];
  const writeResult = samplesToWrite.length
    ? await admin
        .from("raw_health_samples")
        .upsert(samplesToWrite, {
          onConflict: "user_id,source_hash",
          ignoreDuplicates: false,
        })
        .select("id,start_at")
    : { data: [], error: null };
  const insertError = writeResult.error;
  if (insertError) {
    await admin
      .from("raw_health_samples")
      .delete()
      .eq("ingestion_event_id", event.id);
    await admin.from("ingestion_events").delete().eq("id", event.id);
    return safeError(500, "ingestion_failed", requestId);
  }

  const inserted = newSamples.length;
  const updated = updatedSamples.length;
  const duplicates = prepared.length - inserted - updated;
  const affectedDates = [
    ...new Set(
      parsed.data.samples.map((sample) =>
        localDateFor(
          sample.metric_type === "sleep_analysis"
            ? sample.end_at
            : sample.start_at,
          parsed.data.timezone,
        ),
      ),
    ),
  ].sort();
  const stepDates = [
    ...new Set(
      parsed.data.samples
        .filter((sample) => sample.metric_type === "steps")
        .map((sample) => localDateFor(sample.start_at, parsed.data.timezone)),
    ),
  ].sort();
  const arbitration = await recomputeDailySteps(
    admin,
    credential.user_id,
    parsed.data.timezone,
    stepDates,
  );
  if (arbitration.error) {
    await admin
      .from("raw_health_samples")
      .delete()
      .eq("ingestion_event_id", event.id);
    await admin.from("ingestion_events").delete().eq("id", event.id);
    return safeError(500, arbitration.error, requestId);
  }
  await admin
    .from("ingestion_events")
    .update({
      status: "completed",
      inserted_count: inserted,
      duplicate_count: duplicates,
      conflict_count: arbitration.conflicts,
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
      updated,
      duplicates,
    }),
  );
  return jsonResponse(200, {
    ok: true,
    request_id: requestId,
    ingestion_event_id: event.id,
    received: prepared.length,
    inserted,
    updated,
    duplicates,
    rejected: 0,
    conflicts: arbitration.conflicts,
    affected_dates: affectedDates,
  });
});
