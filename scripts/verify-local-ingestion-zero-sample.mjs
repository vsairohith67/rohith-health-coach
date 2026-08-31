import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import process from "node:process";

const endpoint = new URL(
  process.env.RC8_LOCAL_INGESTION_URL ??
    "http://127.0.0.1:54321/functions/v1/ingest-health",
);
if (
  endpoint.protocol !== "http:" ||
  !["127.0.0.1", "localhost"].includes(endpoint.hostname)
) {
  throw new Error(
    "The zero-sample verifier accepts a loopback HTTP endpoint only.",
  );
}

const databaseContainer =
  process.env.RC8_LOCAL_DB_CONTAINER ?? "supabase_db_rohith-health-coach";
if (!/^supabase_db_[a-z0-9_-]+$/i.test(databaseContainer)) {
  throw new Error("The local Supabase database container name is invalid.");
}

const syntheticUserId = "00000000-0000-0000-0000-00000000008c";
const syntheticEmail = "rc8-runtime@example.invalid";

function query(sql) {
  return execFileSync(
    "docker",
    [
      "exec",
      "-i",
      databaseContainer,
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-Atq",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
}

function cleanup() {
  query(`delete from auth.users where id = '${syntheticUserId}';`);
}

cleanup();
const issued = query(`
  begin;
  insert into auth.users(id, email)
  values ('${syntheticUserId}', '${syntheticEmail}');
  set local role authenticated;
  set local "request.jwt.claim.sub" = '${syntheticUserId}';
  select device_id::text || '|' || token
  from public.create_ingestion_credential('Synthetic RC8 Runtime');
  commit;
`)
  .split(/\r?\n/)
  .findLast((line) => line.includes("|"));

if (!issued) {
  cleanup();
  throw new Error("The synthetic credential issuer returned no result.");
}
const [deviceId, deviceToken, ...unexpected] = issued.split("|");
if (
  unexpected.length ||
  !/^[0-9a-f-]{36}$/.test(deviceId ?? "") ||
  !/^[0-9a-f]{64}$/.test(deviceToken ?? "")
) {
  cleanup();
  throw new Error("The synthetic credential issuer returned an invalid shape.");
}

let safeResult;
try {
  const end = new Date();
  const start = new Date(end.getTime() - 60_000);
  const exportId = randomUUID();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${deviceToken}`,
      "Content-Type": "application/json",
      "x-device-id": deviceId,
      "x-idempotency-key": `rc8-zero|${deviceId}|${exportId}`,
      "x-request-id": randomUUID(),
    },
    body: JSON.stringify({
      schema_version: "1.0",
      export_id: exportId,
      exported_at: end.toISOString(),
      timezone: "Asia/Kolkata",
      device: {
        device_id: deviceId,
        device_name: "Synthetic RC8 Runtime",
        source: "apple_shortcut",
        shortcut_version: "1.0.0",
      },
      window: { start: start.toISOString(), end: end.toISOString() },
      samples: [],
    }),
  });
  const body = await response.json().catch(() => null);
  const expectedZeroFields = [
    "received",
    "inserted",
    "updated",
    "duplicates",
    "rejected",
    "conflicts",
  ];
  if (
    response.status !== 200 ||
    body?.ok !== true ||
    expectedZeroFields.some((field) => body?.[field] !== 0) ||
    !Array.isArray(body?.affected_dates) ||
    body.affected_dates.length !== 0
  ) {
    throw new Error(
      `The local zero-sample request failed safe validation (HTTP ${response.status}).`,
    );
  }
  safeResult = {
    status: response.status,
    ok: true,
    received: 0,
    inserted: 0,
    updated: 0,
    duplicates: 0,
    rejected: 0,
    conflicts: 0,
    affected_dates: 0,
  };
} finally {
  cleanup();
}

const cleanupCounts = query(`
  select
    (select count(*) from auth.users where id = '${syntheticUserId}') || '|' ||
    (select count(*) from public.devices where user_id = '${syntheticUserId}') || '|' ||
    (select count(*) from private.ingestion_credentials where user_id = '${syntheticUserId}') || '|' ||
    (select count(*) from public.ingestion_events where user_id = '${syntheticUserId}') || '|' ||
    (select count(*) from public.raw_health_samples where user_id = '${syntheticUserId}');
`);
if (cleanupCounts !== "0|0|0|0|0") {
  throw new Error("Synthetic local runtime cleanup did not complete.");
}

process.stdout.write(
  `Local zero-sample ingestion passed: ${JSON.stringify(safeResult)}; cleanup=0|0|0|0|0\n`,
);
