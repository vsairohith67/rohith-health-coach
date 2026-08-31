import { createClient } from "@supabase/supabase-js";
import { generateCoachFindings } from "@rohith-health/coach";
import type { DailyMetric } from "@rohith-health/domain";

const required = [
  "RC7_SUPABASE_URL",
  "RC7_SUPABASE_KEY",
  "RC7_USER_A_ID",
  "RC7_USER_A_EMAIL",
  "RC7_USER_A_PASSWORD",
  "RC7_USER_B_ID",
  "RC7_USER_B_EMAIL",
  "RC7_USER_B_PASSWORD",
] as const;

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const url = process.env.RC7_SUPABASE_URL as string;
const key = process.env.RC7_SUPABASE_KEY as string;
const userAId = process.env.RC7_USER_A_ID as string;
const userBId = process.env.RC7_USER_B_ID as string;
const userAEmail = process.env.RC7_USER_A_EMAIL as string;
const userBEmail = process.env.RC7_USER_B_EMAIL as string;
const userAPassword = process.env.RC7_USER_A_PASSWORD as string;
const userBPassword = process.env.RC7_USER_B_PASSWORD as string;

type Check = { name: string; passed: boolean; detail: string };
const checks: Check[] = [];
const record = (name: string, passed: boolean, detail: string) =>
  checks.push({ name, passed, detail });

const options = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};
const clientA = createClient(url, key, options);
const clientB = createClient(url, key, options);
const anonymous = createClient(url, key, options);

const signedInA = await clientA.auth.signInWithPassword({
  email: userAEmail,
  password: userAPassword,
});
record("Authorized synthetic sign-in", !signedInA.error, "auth_checked");

const unauthorized = await anonymous.auth.signInWithPassword({
  email: userAEmail,
  password: "RC7-INTENTIONALLY-WRONG-PASSWORD",
});
record(
  "Unauthorized sign-in is rejected",
  Boolean(unauthorized.error) && !unauthorized.data.user,
  "auth_checked",
);

const publicSignup = await anonymous.auth.signUp({
  email: `rc7-public-${Date.now()}@example.invalid`,
  password: "RC7-Synthetic-Public-Signup-Negative!",
});
record(
  "Public signup is rejected",
  Boolean(publicSignup.error) && !publicSignup.data.user,
  "signup_checked",
);

const signedInB = await clientB.auth.signInWithPassword({
  email: userBEmail,
  password: userBPassword,
});
record("Test User B sign-in", !signedInB.error, "auth_checked");

const ownProfile = await clientA
  .from("profiles")
  .select("user_id")
  .eq("user_id", userAId);
record(
  "User A reads own profile",
  !ownProfile.error && ownProfile.data.length === 1,
  "owner_scope_checked",
);

const ownHealth = await clientA
  .from("raw_health_samples")
  .select("user_id")
  .eq("user_id", userAId);
record(
  "User A reads own hosted synthetic health rows",
  !ownHealth.error && (ownHealth.data?.length ?? 0) > 0,
  `rows=${ownHealth.data?.length ?? 0}`,
);

const bReadsA = await clientB
  .from("raw_health_samples")
  .select("user_id")
  .eq("user_id", userAId);
const aReadsB = await clientA
  .from("raw_health_samples")
  .select("user_id")
  .eq("user_id", userBId);
record(
  "User A and User B are mutually isolated",
  !bReadsA.error &&
    !aReadsB.error &&
    bReadsA.data.length === 0 &&
    aReadsB.data.length === 0,
  "mutual_isolation_checked",
);

const anonHealth = await anonymous.from("raw_health_samples").select("user_id");
record(
  "Anonymous health access is denied",
  Boolean(anonHealth.error) || (anonHealth.data?.length ?? 0) === 0,
  "anonymous_scope_checked",
);

const createdDeviceId = "20000000-0000-0000-0000-00000000c71a";
const createDevice = await clientA.from("devices").insert({
  id: createdDeviceId,
  user_id: userAId,
  provider_connection_id: "10000000-0000-0000-0000-00000000c70a",
  device_name: "RC7 E2E created device",
  device_type: "phone",
  manufacturer: "Synthetic",
  model: "RC7",
  external_device_id: "rc7-created-device",
  source_system: "apple_shortcut",
});
record(
  "User A creates an owner-scoped device",
  !createDevice.error,
  "rls_checked",
);

const metricRows = await clientA
  .from("daily_metrics")
  .select("local_date,steps,day_completion_status,source_coverage")
  .eq("user_id", userAId)
  .order("local_date", { ascending: true });
const coachDays: DailyMetric[] = (metricRows.data ?? []).map((row) => ({
  userId: userAId,
  localDate: row.local_date,
  timezone: "Asia/Kolkata",
  dayCompletionStatus:
    row.day_completion_status === "complete" ? "complete" : "partial",
  sleepMinutes: null,
  bedtimeLocal: null,
  wakeTimeLocal: null,
  steps: row.steps,
  activeEnergyKcal: null,
  workoutMinutes: null,
  restingHeartRate: null,
  hrvSdnnMs: null,
  energyRating: null,
  focusRating: null,
  completenessPercent: row.steps === null ? 0 : 100,
  source: "demo",
  sourceTimestamp: `${row.local_date}T23:59:59+05:30`,
  qualityFlags: [],
}));
const findingsOne = generateCoachFindings(coachDays);
const findingsTwo = generateCoachFindings(coachDays);
record(
  "Deterministic coach is stable on hosted-derived state",
  !metricRows.error &&
    findingsOne.length > 0 &&
    JSON.stringify(findingsOne) === JSON.stringify(findingsTwo),
  `findings=${findingsOne.length}`,
);

const exportBucket = "exports-private";
const exportPath = `${userAId}/rc7-synthetic-export.json`;
const exportFixture = new Blob(
  [JSON.stringify({ synthetic: true, records: [] })],
  { type: "application/json" },
);
const exportUpload = await clientA.storage
  .from(exportBucket)
  .upload(exportPath, exportFixture, {
    contentType: "application/json",
    upsert: false,
  });
const exportByB = await clientB.storage.from(exportBucket).download(exportPath);
const exportByAnon = await anonymous.storage
  .from(exportBucket)
  .download(exportPath);
record(
  "Synthetic export is private and owner-scoped",
  !exportUpload.error &&
    Boolean(exportByB.error) &&
    Boolean(exportByAnon.error),
  "private_export_checked",
);

const signedExport = await clientA.storage
  .from(exportBucket)
  .createSignedUrl(exportPath, 1);
let expired = false;
if (signedExport.data?.signedUrl) {
  await new Promise((resolve) => setTimeout(resolve, 2_500));
  const response = await fetch(signedExport.data.signedUrl, {
    cache: "no-store",
  });
  expired = !response.ok;
}
record(
  "Signed export URL expires",
  !signedExport.error && expired,
  "signed_url_expiration_checked",
);

const deletionRequest = await clientA.rpc("request_account_deletion", {
  p_scope: "health_data",
});
const bDeletionJobs = await clientB
  .from("deletion_jobs")
  .select("user_id")
  .eq("user_id", userAId);
record(
  "Selective deletion request is owner-scoped",
  !deletionRequest.error &&
    !bDeletionJobs.error &&
    bDeletionJobs.data.length === 0,
  "deletion_scope_checked",
);

await clientA.storage.from(exportBucket).remove([exportPath]);
await clientA.from("devices").delete().eq("id", createdDeviceId);
await clientA.auth.signOut({ scope: "global" });
const postSignOut = await clientA.from("profiles").select("user_id");
record(
  "Synthetic sign-out denies subsequent private access",
  Boolean(postSignOut.error) || (postSignOut.data?.length ?? 0) === 0,
  "post_signout_checked",
);
await clientB.auth.signOut({ scope: "global" });

const failures = checks.filter((check) => !check.passed);
process.stderr.write(
  `${JSON.stringify({
    total: checks.length,
    passed: checks.length - failures.length,
    failed: failures.length,
    failures,
  })}\n`,
);
if (failures.length > 0) process.exitCode = 1;
