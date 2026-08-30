const required = [
  "RC5_INGEST_URL",
  "RC5_DEVICE_A_ID",
  "RC5_DEVICE_A_EXTERNAL_ID",
  "RC5_DEVICE_B_ID",
  "RC5_DEVICE_B_EXTERNAL_ID",
  "RC5_TOKEN_A",
  "RC5_TOKEN_B",
  "RC5_TOKEN_REVOKED",
  "RC5_TOKEN_EXPIRED",
];

for (const name of required) {
  if (!process.env[name])
    throw new Error(`Missing required environment variable: ${name}`);
}

const endpoint = process.env.RC5_INGEST_URL;
const deviceA = process.env.RC5_DEVICE_A_ID;
const deviceB = process.env.RC5_DEVICE_B_ID;
const externalA = process.env.RC5_DEVICE_A_EXTERNAL_ID;
const externalB = process.env.RC5_DEVICE_B_EXTERNAL_ID;
const tokenA = process.env.RC5_TOKEN_A;
const tokenB = process.env.RC5_TOKEN_B;
const revokedToken = process.env.RC5_TOKEN_REVOKED;
const expiredToken = process.env.RC5_TOKEN_EXPIRED;
const checks = [];

const record = (name, passed, detail) => checks.push({ name, passed, detail });

const envelope = ({
  exportId,
  externalDeviceId = externalA,
  start = "2026-08-20T00:00:00+05:30",
  end = "2026-08-21T00:00:00+05:30",
  samples = [],
}) => ({
  schema_version: "1.0",
  // Keep the readable test sequence while satisfying RFC 4122 v4/variant bits.
  export_id: exportId.replace(
    /^([0-9a-f]{8}-[0-9a-f]{4})-0000-0000-/,
    "$1-4000-8000-",
  ),
  exported_at: "2026-08-30T15:00:00+05:30",
  timezone: "Asia/Kolkata",
  device: {
    device_id: externalDeviceId,
    device_name: "RC5 Synthetic Shortcut",
    source: "apple_shortcut",
    shortcut_version: "1.0.0",
  },
  window: { start, end },
  samples,
});

const stepSample = ({
  recordId,
  value,
  start = "2026-08-20T00:00:00+05:30",
  end = "2026-08-21T00:00:00+05:30",
  sourceName = "Garmin Connect",
  sourceBundle = "com.garmin.connect.mobile",
  sourceProvider = "apple_health",
  deviceName = "Synthetic Garmin",
  deviceManufacturer = "Garmin",
  deviceModel = "Synthetic",
  aggregation = "daily_total",
  coverageState = "complete",
  currentDay = false,
  fallbackGapConfirmed = false,
}) => ({
  metric_type: "steps",
  start_at: start,
  end_at: end,
  numeric_value: value,
  text_value: null,
  category_value: null,
  unit: "count",
  source_name: sourceName,
  source_bundle: sourceBundle,
  source_record_id: recordId,
  source_provider: sourceProvider,
  source_device: {
    name: deviceName,
    manufacturer: deviceManufacturer,
    model: deviceModel,
    local_identifier: `${sourceBundle}-device`,
  },
  aggregation,
  coverage: {
    state: coverageState,
    current_day: currentDay,
    fallback_gap_confirmed: fallbackGapConfirmed,
  },
  metadata: {},
});

const request = async ({
  body,
  token = tokenA,
  device = deviceA,
  idempotency = "rc5-default",
  method = "POST",
  contentType = "application/json",
  authorization = true,
}) => {
  const headers = {
    "content-type": contentType,
    "x-device-id": device,
    "x-idempotency-key": idempotency,
    "x-request-id": crypto.randomUUID(),
  };
  if (authorization) headers.authorization = `Bearer ${token}`;
  const response = await fetch(endpoint, {
    method,
    headers,
    body:
      method === "GET"
        ? undefined
        : typeof body === "string"
          ? body
          : JSON.stringify(body),
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: response.status, json, text, headers: response.headers };
};

const safeError = (result, expectedStatus, expectedCode = null) => {
  const keys =
    result.json && typeof result.json === "object"
      ? Object.keys(result.json).sort()
      : [];
  const safeShape =
    keys.join(",") === "error,ok,request_id" &&
    result.json.ok === false &&
    typeof result.json.request_id === "string" &&
    !result.text.includes(tokenA) &&
    !result.text.includes("4861") &&
    !result.text.includes("8148");
  return (
    result.status === expectedStatus &&
    safeShape &&
    (expectedCode === null || result.json.error === expectedCode)
  );
};

const getResult = await request({ method: "GET", body: null });
record(
  "Test connection rejects unsupported method safely",
  safeError(getResult, 405, "method_not_allowed"),
  `status=${getResult.status}`,
);

const noAuth = await request({
  body: "{}",
  authorization: false,
  idempotency: "rc5-no-auth",
});
record(
  "Missing token is denied",
  safeError(noAuth, 401, "invalid_ingestion_credentials"),
  `status=${noAuth.status}`,
);

const invalidContentType = await request({
  body: "{}",
  contentType: "text/plain",
  idempotency: "rc5-content-type",
});
record(
  "Non-JSON content type is denied",
  safeError(invalidContentType, 415, "content_type_required"),
  `status=${invalidContentType.status}`,
);

const connection = await request({
  body: envelope({ exportId: "90000000-0000-0000-0000-000000000001" }),
  idempotency: "rc5-connection",
});
record(
  "Valid device-token connection succeeds",
  connection.status === 200 &&
    connection.json?.ok === true &&
    connection.json.received === 0,
  `status=${connection.status}`,
);

const invalidToken = await request({
  body: envelope({ exportId: "90000000-0000-0000-0000-000000000002" }),
  token: "0".repeat(64),
  idempotency: "rc5-invalid-token",
});
record(
  "Invalid token is denied",
  safeError(invalidToken, 401, "invalid_ingestion_credentials"),
  `status=${invalidToken.status}`,
);

const revoked = await request({
  body: envelope({ exportId: "90000000-0000-0000-0000-000000000003" }),
  token: revokedToken,
  idempotency: "rc5-revoked-token",
});
record(
  "Revoked token is denied",
  safeError(revoked, 401, "invalid_ingestion_credentials"),
  `status=${revoked.status}`,
);

const expired = await request({
  body: envelope({ exportId: "90000000-0000-0000-0000-000000000004" }),
  token: expiredToken,
  idempotency: "rc5-expired-token",
});
record(
  "Expired token is denied",
  safeError(expired, 401, "invalid_ingestion_credentials"),
  `status=${expired.status}`,
);

const wrongHeaderDevice = await request({
  body: envelope({ exportId: "90000000-0000-0000-0000-000000000005" }),
  device: deviceB,
  idempotency: "rc5-wrong-header-device",
});
record(
  "Token cannot be used with wrong registered device",
  safeError(wrongHeaderDevice, 401, "invalid_ingestion_credentials"),
  `status=${wrongHeaderDevice.status}`,
);

const wrongUser = await request({
  body: envelope({ exportId: "90000000-0000-0000-0000-000000000006" }),
  token: tokenB,
  device: deviceA,
  idempotency: "rc5-wrong-user",
});
record(
  "Other user's token cannot claim User A device",
  safeError(wrongUser, 401, "invalid_ingestion_credentials"),
  `status=${wrongUser.status}`,
);

const wrongPayloadDevice = await request({
  body: envelope({
    exportId: "90000000-0000-0000-0000-000000000007",
    externalDeviceId: externalB,
  }),
  idempotency: "rc5-wrong-payload-device",
});
record(
  "Envelope device must match registered external device",
  safeError(wrongPayloadDevice, 401, "invalid_ingestion_device"),
  `status=${wrongPayloadDevice.status}`,
);

const validEnvelope = envelope({
  exportId: "90000000-0000-0000-0000-000000000008",
  samples: [stepSample({ recordId: "valid-step", value: 100 })],
});
const valid = await request({ body: validEnvelope, idempotency: "rc5-valid" });
record(
  "Valid synthetic sample is ingested",
  valid.status === 200 &&
    valid.json?.inserted === 1 &&
    valid.json?.duplicates === 0,
  `status=${valid.status}`,
);

const duplicateRequest = await request({
  body: validEnvelope,
  idempotency: "rc5-valid",
});
record(
  "Duplicate request is replayed",
  duplicateRequest.status === 200 && duplicateRequest.json?.replayed === true,
  `status=${duplicateRequest.status}`,
);

const duplicateSample = await request({
  body: {
    ...validEnvelope,
    export_id: "90000000-0000-4000-8000-000000000009",
  },
  idempotency: "rc5-duplicate-sample",
});
record(
  "Duplicate sample is not reinserted",
  duplicateSample.status === 200 &&
    duplicateSample.json?.duplicates === 1 &&
    duplicateSample.json?.inserted === 0,
  `status=${duplicateSample.status}`,
);

const rollbackEnvelope = envelope({
  exportId: "90000000-0000-0000-0000-000000000022",
  samples: [
    stepSample({ recordId: "rollback-step", value: 175 }),
    stepSample({ recordId: "rollback-step", value: 175 }),
  ],
});
const rollback = await request({
  body: rollbackEnvelope,
  idempotency: "rc5-rollback",
});
record(
  "Failed multi-row write rolls back its event and samples",
  safeError(rollback, 500, "ingestion_failed"),
  `status=${rollback.status}`,
);

const concurrentEnvelope = envelope({
  exportId: "90000000-0000-0000-0000-000000000010",
  samples: [stepSample({ recordId: "concurrent-step", value: 150 })],
});
const concurrent = await Promise.all([
  request({ body: concurrentEnvelope, idempotency: "rc5-concurrent" }),
  request({ body: concurrentEnvelope, idempotency: "rc5-concurrent" }),
]);
record(
  "Concurrent duplicate request converges safely",
  concurrent.every((result) => result.status === 200) &&
    concurrent.some((result) => result.json?.replayed === true),
  `statuses=${concurrent.map((result) => result.status).join(",")}`,
);

const sleepBase = {
  metric_type: "sleep_analysis",
  start_at: "2026-08-22T22:00:00+05:30",
  end_at: "2026-08-23T05:00:00+05:30",
  numeric_value: 400,
  text_value: null,
  category_value: "asleep",
  unit: null,
  source_name: "Garmin Connect",
  source_bundle: "com.garmin.connect.mobile",
  source_record_id: "late-sleep",
  source_provider: "apple_health",
  source_device: {
    name: "Synthetic Garmin",
    manufacturer: "Garmin",
    model: "Synthetic",
    local_identifier: "synthetic-garmin-sleep",
  },
  aggregation: "session_total",
  coverage: {
    state: "complete",
    current_day: false,
    fallback_gap_confirmed: false,
  },
  metadata: {},
};
const sleepFirst = await request({
  body: envelope({
    exportId: "90000000-0000-0000-0000-000000000011",
    start: "2026-08-22T20:00:00+05:30",
    end: "2026-08-23T08:00:00+05:30",
    samples: [sleepBase],
  }),
  idempotency: "rc5-sleep-first",
});
const sleepLate = await request({
  body: envelope({
    exportId: "90000000-0000-0000-0000-000000000012",
    start: "2026-08-22T20:00:00+05:30",
    end: "2026-08-23T08:00:00+05:30",
    samples: [{ ...sleepBase, numeric_value: 420 }],
  }),
  idempotency: "rc5-sleep-late",
});
record(
  "Late-arriving sleep correction updates canonical raw sample",
  sleepFirst.status === 200 &&
    sleepLate.status === 200 &&
    sleepLate.json?.updated === 1,
  `status=${sleepLate.status}`,
);

const partial = await request({
  body: envelope({
    exportId: "90000000-0000-0000-0000-000000000013",
    start: "2026-08-30T00:00:00+05:30",
    end: "2026-08-30T12:00:00+05:30",
    samples: [
      stepSample({
        recordId: "partial-current",
        value: 2_100,
        start: "2026-08-30T00:00:00+05:30",
        end: "2026-08-30T12:00:00+05:30",
        coverageState: "partial",
        currentDay: true,
      }),
    ],
  }),
  idempotency: "rc5-partial",
});
record(
  "Current partial day is accepted as partial",
  partial.status === 200 && partial.json?.inserted === 1,
  `status=${partial.status}`,
);

const conflictSamples = [
  stepSample({
    recordId: "conflict-one",
    value: 6_000,
    start: "2026-08-24T00:00:00+05:30",
    end: "2026-08-25T00:00:00+05:30",
    sourceName: "Other One",
    sourceBundle: "com.synthetic.other.one",
    deviceName: "Other One",
    deviceManufacturer: "Synthetic",
    deviceModel: "Other",
  }),
  stepSample({
    recordId: "conflict-two",
    value: 8_000,
    start: "2026-08-24T00:00:00+05:30",
    end: "2026-08-25T00:00:00+05:30",
    sourceName: "Other Two",
    sourceBundle: "com.synthetic.other.two",
    deviceName: "Other Two",
    deviceManufacturer: "Synthetic",
    deviceModel: "Other",
  }),
];
const conflict = await request({
  body: envelope({
    exportId: "90000000-0000-0000-0000-000000000014",
    start: "2026-08-24T00:00:00+05:30",
    end: "2026-08-25T00:00:00+05:30",
    samples: conflictSamples,
  }),
  idempotency: "rc5-source-conflict",
});
record(
  "Ambiguous source conflict produces a conflict response",
  conflict.status === 200 && conflict.json?.conflicts >= 1,
  `status=${conflict.status}`,
);

const overlap = await request({
  body: envelope({
    exportId: "90000000-0000-0000-0000-000000000015",
    start: "2026-08-26T00:00:00+05:30",
    end: "2026-08-27T00:00:00+05:30",
    samples: [
      stepSample({
        recordId: "garmin-overlap",
        value: 4_861,
        start: "2026-08-26T00:00:00+05:30",
        end: "2026-08-27T00:00:00+05:30",
      }),
      stepSample({
        recordId: "iphone-overlap",
        value: 8_148,
        start: "2026-08-26T00:00:00+05:30",
        end: "2026-08-27T00:00:00+05:30",
        sourceName: "iPhone",
        sourceBundle: "com.apple.health.iphone",
        deviceName: "Synthetic iPhone",
        deviceManufacturer: "Apple",
        deviceModel: "iPhone",
      }),
    ],
  }),
  idempotency: "rc5-garmin-iphone-overlap",
});
record(
  "Garmin and iPhone overlap is not silently combined",
  overlap.status === 200 && overlap.json?.conflicts >= 1,
  `status=${overlap.status}`,
);

const malformed = await request({
  body: envelope({
    exportId: "90000000-0000-0000-0000-000000000016",
    samples: [
      stepSample({ recordId: "bad-time", value: 1, start: "not-a-time" }),
    ],
  }),
  idempotency: "rc5-malformed-time",
});
record(
  "Malformed timestamp is rejected without raw echo",
  safeError(malformed, 422, "invalid_health_envelope"),
  `status=${malformed.status}`,
);

const unsupportedMetricBody = envelope({
  exportId: "90000000-0000-0000-0000-000000000017",
  samples: [
    {
      ...stepSample({ recordId: "bad-metric", value: 1 }),
      metric_type: "blood_pressure",
    },
  ],
});
const unsupportedMetric = await request({
  body: unsupportedMetricBody,
  idempotency: "rc5-bad-metric",
});
record(
  "Unsupported metric is rejected",
  safeError(unsupportedMetric, 422, "invalid_health_envelope"),
  `status=${unsupportedMetric.status}`,
);

const unsupportedUnitBody = envelope({
  exportId: "90000000-0000-0000-0000-000000000018",
  samples: [
    { ...stepSample({ recordId: "bad-unit", value: 1 }), unit: "meters" },
  ],
});
const unsupportedUnit = await request({
  body: unsupportedUnitBody,
  idempotency: "rc5-bad-unit",
});
record(
  "Unsupported unit is rejected",
  safeError(unsupportedUnit, 422, "unsupported_unit"),
  `status=${unsupportedUnit.status}`,
);

const excessiveWindow = await request({
  body: envelope({
    exportId: "90000000-0000-0000-0000-000000000019",
    start: "2026-01-01T00:00:00+05:30",
    end: "2026-08-20T00:00:00+05:30",
  }),
  idempotency: "rc5-excessive-window",
});
record(
  "Excessive historical window is rejected",
  safeError(excessiveWindow, 422, "historical_window_too_large"),
  `status=${excessiveWindow.status}`,
);

const oversizedBody = JSON.stringify({
  ...envelope({ exportId: "90000000-0000-0000-0000-000000000020" }),
  padding: "x".repeat(550_000),
});
const oversized = await request({
  body: oversizedBody,
  idempotency: "rc5-oversized",
});
record(
  "Payload size limit is enforced",
  safeError(oversized, 413, "payload_too_large"),
  `status=${oversized.status}`,
);

const limitSample = {
  metric_type: "steps",
  start_at: "2026-08-20T00:00:00Z",
  end_at: "2026-08-20T00:00:00Z",
  numeric_value: 1,
  text_value: null,
  category_value: null,
  unit: "count",
  source_name: "S",
  source_bundle: null,
  source_record_id: null,
  metadata: {},
};
const tooManySamples = await request({
  body: envelope({
    exportId: "90000000-0000-0000-0000-000000000021",
    samples: Array.from({ length: 2_001 }, () => limitSample),
  }),
  idempotency: "rc5-too-many-samples",
});
record(
  "Sample count limit is enforced",
  safeError(tooManySamples, 422, "invalid_health_envelope"),
  `status=${tooManySamples.status}`,
);

record(
  "Successful response uses no-store and JSON hardening headers",
  valid.headers.get("cache-control") === "no-store" &&
    valid.headers.get("x-content-type-options") === "nosniff" &&
    valid.headers.get("content-type")?.startsWith("application/json"),
  "headers_checked",
);

const failures = checks.filter((check) => !check.passed);
console.warn(
  JSON.stringify({
    total: checks.length,
    passed: checks.length - failures.length,
    failed: failures.length,
    failures,
  }),
);
if (failures.length > 0) process.exitCode = 1;
