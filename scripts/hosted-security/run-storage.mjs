import { createClient } from "@supabase/supabase-js";

const required = [
  "RC5_SUPABASE_URL",
  "RC5_SUPABASE_KEY",
  "RC5_USER_A_ID",
  "RC5_USER_A_EMAIL",
  "RC5_USER_A_PASSWORD",
  "RC5_USER_B_ID",
  "RC5_USER_B_EMAIL",
  "RC5_USER_B_PASSWORD",
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const url = process.env.RC5_SUPABASE_URL;
const key = process.env.RC5_SUPABASE_KEY;
const userAId = process.env.RC5_USER_A_ID;
const userBId = process.env.RC5_USER_B_ID;
const bucket = "fit-private";
const pathA = `${userAId}/rc5-storage-a.fit`;
const pathB = `${userBId}/rc5-storage-b.fit`;
const unsafePath = `${userAId}/../escape.fit`;
const fixture = new Blob(["RC5 synthetic FIT fixture\n"], {
  type: "application/octet-stream",
});

const checks = [];
const record = (name, passed, detail) => {
  checks.push({ name, passed, detail });
};
const safeError = (error) =>
  error
    ? String(error.statusCode ?? error.status ?? error.name ?? "error")
    : "none";

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};

const clientA = createClient(url, key, clientOptions);
const clientB = createClient(url, key, clientOptions);
const anonymous = createClient(url, key, clientOptions);

const signInA = await clientA.auth.signInWithPassword({
  email: process.env.RC5_USER_A_EMAIL,
  password: process.env.RC5_USER_A_PASSWORD,
});
record(
  "Test User A password sign-in",
  !signInA.error,
  safeError(signInA.error),
);

const signInB = await clientB.auth.signInWithPassword({
  email: process.env.RC5_USER_B_EMAIL,
  password: process.env.RC5_USER_B_PASSWORD,
});
record(
  "Test User B password sign-in",
  !signInB.error,
  safeError(signInB.error),
);

if (signInA.error || signInB.error) {
  console.warn(
    JSON.stringify({
      total: checks.length,
      passed: checks.filter((check) => check.passed).length,
      failed: checks.filter((check) => !check.passed).length,
      failures: checks.filter((check) => !check.passed),
    }),
  );
  process.exitCode = 1;
} else {
  try {
    const uploadA = await clientA.storage.from(bucket).upload(pathA, fixture, {
      contentType: "application/octet-stream",
      upsert: false,
    });
    record(
      "User A uploads own object",
      !uploadA.error,
      safeError(uploadA.error),
    );

    const uploadB = await clientB.storage.from(bucket).upload(pathB, fixture, {
      contentType: "application/octet-stream",
      upsert: false,
    });
    record(
      "User B uploads own object",
      !uploadB.error,
      safeError(uploadB.error),
    );

    const ownDownloadA = await clientA.storage.from(bucket).download(pathA);
    const ownTextA = ownDownloadA.data ? await ownDownloadA.data.text() : "";
    record(
      "User A downloads own object",
      !ownDownloadA.error && ownTextA === "RC5 synthetic FIT fixture\n",
      safeError(ownDownloadA.error),
    );

    const ownDownloadB = await clientB.storage.from(bucket).download(pathB);
    const ownTextB = ownDownloadB.data ? await ownDownloadB.data.text() : "";
    record(
      "User B downloads own object",
      !ownDownloadB.error && ownTextB === "RC5 synthetic FIT fixture\n",
      safeError(ownDownloadB.error),
    );

    const bReadsA = await clientB.storage.from(bucket).download(pathA);
    record(
      "User B cannot read User A object",
      Boolean(bReadsA.error),
      safeError(bReadsA.error),
    );

    const aReadsB = await clientA.storage.from(bucket).download(pathB);
    record(
      "User A cannot read User B object",
      Boolean(aReadsB.error),
      safeError(aReadsB.error),
    );

    const anonymousReadsA = await anonymous.storage
      .from(bucket)
      .download(pathA);
    record(
      "Anonymous cannot read private object",
      Boolean(anonymousReadsA.error),
      safeError(anonymousReadsA.error),
    );

    const aGuessesB = await clientA.storage
      .from(bucket)
      .download(`${userBId}/guessed.fit`);
    record(
      "Guessed cross-user path is denied",
      Boolean(aGuessesB.error),
      safeError(aGuessesB.error),
    );

    const listA = await clientA.storage.from(bucket).list(userAId, {
      search: "rc5-storage",
    });
    record(
      "User A lists only own prefix",
      !listA.error &&
        listA.data.some((entry) => entry.name === "rc5-storage-a.fit"),
      safeError(listA.error),
    );

    const listBFromA = await clientA.storage.from(bucket).list(userBId, {
      search: "rc5-storage",
    });
    record(
      "User A cannot list User B prefix",
      !listBFromA.error && listBFromA.data.length === 0,
      safeError(listBFromA.error),
    );

    const unsafeUpload = await clientA.storage
      .from(bucket)
      .upload(unsafePath, fixture, {
        contentType: "application/octet-stream",
        upsert: false,
      });
    record(
      "Unsafe parent path is rejected",
      Boolean(unsafeUpload.error),
      safeError(unsafeUpload.error),
    );

    const signedA = await clientA.storage
      .from(bucket)
      .createSignedUrl(pathA, 60);
    record(
      "User A creates own signed URL",
      !signedA.error,
      safeError(signedA.error),
    );

    const signedByB = await clientB.storage
      .from(bucket)
      .createSignedUrl(pathA, 60);
    record(
      "User B cannot sign User A object",
      Boolean(signedByB.error),
      safeError(signedByB.error),
    );

    const signedAnon = await anonymous.storage
      .from(bucket)
      .createSignedUrl(pathA, 60);
    record(
      "Anonymous cannot create signed URL",
      Boolean(signedAnon.error),
      safeError(signedAnon.error),
    );

    if (signedA.data?.signedUrl) {
      const signedFetch = await fetch(signedA.data.signedUrl, {
        cache: "no-store",
      });
      record(
        "Own signed URL is initially usable",
        signedFetch.ok,
        `status=${signedFetch.status}`,
      );
    } else {
      record("Own signed URL is initially usable", false, "signed_url_missing");
    }

    const expiring = await clientA.storage
      .from(bucket)
      .createSignedUrl(pathA, 1);
    if (expiring.data?.signedUrl) {
      await new Promise((resolve) => setTimeout(resolve, 2_500));
      const expiredFetch = await fetch(expiring.data.signedUrl, {
        cache: "no-store",
      });
      record(
        "Signed URL expires",
        !expiredFetch.ok,
        `status=${expiredFetch.status}`,
      );
    } else {
      record("Signed URL expires", false, safeError(expiring.error));
    }

    const bRemovesA = await clientB.storage.from(bucket).remove([pathA]);
    const stillThereForA = await clientA.storage.from(bucket).download(pathA);
    record(
      "User B cannot delete User A object",
      Boolean(bRemovesA.error) || !stillThereForA.error,
      safeError(bRemovesA.error),
    );

    const aRemovesOwn = await clientA.storage.from(bucket).remove([pathA]);
    const removedA = await clientA.storage.from(bucket).download(pathA);
    record(
      "User A deletes own object",
      !aRemovesOwn.error && Boolean(removedA.error),
      safeError(aRemovesOwn.error),
    );

    const bRemovesOwn = await clientB.storage.from(bucket).remove([pathB]);
    const removedB = await clientB.storage.from(bucket).download(pathB);
    record(
      "User B deletes own object",
      !bRemovesOwn.error && Boolean(removedB.error),
      safeError(bRemovesOwn.error),
    );
  } finally {
    await clientA.storage.from(bucket).remove([pathA, unsafePath]);
    await clientB.storage.from(bucket).remove([pathB]);
    await clientA.auth.signOut({ scope: "local" });
    await clientB.auth.signOut({ scope: "local" });
  }

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
}
