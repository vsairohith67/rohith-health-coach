import { createClient } from "@supabase/supabase-js";
import * as privateLogin from "../../apps/web/lib/auth/private-login";

const { PRIVATE_SIGN_IN_RESPONSE, requestPrivateSignInLink } = privateLogin;

type SafeError = {
  code: string | null;
  message: string;
  status: number | null;
};

type AuthTestResult = {
  case: number;
  error?: SafeError | null;
  errorCode?: string | null;
  genericResponse?: boolean;
  httpStatus?: number;
  name: string;
  pass: boolean;
  userCreated?: boolean;
};

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required in process memory.",
  );
}

const callback = "https://rohith-health-coach.vercel.app/auth/callback";
const stamp = Date.now();
const client = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

function syntheticEmail(label: string): string {
  return `rc7-${label}-${stamp}@example.invalid`;
}

function safeError(error: unknown): SafeError | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const candidate = error as {
    code?: unknown;
    message?: unknown;
    status?: unknown;
  };

  return {
    code: typeof candidate.code === "string" ? candidate.code : null,
    message: String(candidate.message ?? "")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+/gi, "SYNTHETIC_EMAIL")
      .slice(0, 160),
    status: typeof candidate.status === "number" ? candidate.status : null,
  };
}

const results: AuthTestResult[] = [];

const sdkSignup = await client.auth.signUp({
  email: syntheticEmail("sdk"),
  password: "Rc7Synthetic!Pass-Only-For-Negative-Test",
});
results.push({
  case: 1,
  error: safeError(sdkSignup.error),
  name: "sdk_email_password_signup",
  pass: Boolean(sdkSignup.error) && !sdkSignup.data.user,
  userCreated: Boolean(sdkSignup.data.user),
});

const rawSignup = await fetch(`${url}/auth/v1/signup`, {
  body: JSON.stringify({
    email: syntheticEmail("raw"),
    password: "Rc7Synthetic!Raw-Only-Negative-Test",
  }),
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  method: "POST",
});
let rawBody: Record<string, unknown> = {};
try {
  rawBody = (await rawSignup.json()) as Record<string, unknown>;
} catch {
  // The status code remains sufficient for a safe negative-test result.
}
results.push({
  case: 2,
  errorCode:
    typeof rawBody.code === "string"
      ? rawBody.code
      : typeof rawBody.error_code === "string"
        ? rawBody.error_code
        : null,
  httpStatus: rawSignup.status,
  name: "raw_auth_signup_api",
  pass: !rawSignup.ok && !rawBody.id,
  userCreated: Boolean(rawBody.id),
});

const magicLink = await client.auth.signInWithOtp({
  email: syntheticEmail("magic"),
  options: {
    emailRedirectTo: callback,
    shouldCreateUser: false,
  },
});
results.push({
  case: 3,
  error: safeError(magicLink.error),
  name: "unknown_magic_link_should_create_false",
  pass: Boolean(magicLink.error) && !magicLink.data.user,
  userCreated: Boolean(magicLink.data.user),
});

const applicationResponse = await requestPrivateSignInLink(
  client,
  syntheticEmail("application"),
  callback,
);
results.push({
  case: 4,
  genericResponse: applicationResponse === PRIVATE_SIGN_IN_RESPONSE,
  name: "application_private_login_helper",
  pass: applicationResponse === PRIVATE_SIGN_IN_RESPONSE,
});

const anonymousSignup = await client.auth.signInAnonymously();
results.push({
  case: 5,
  error: safeError(anonymousSignup.error),
  name: "anonymous_signup",
  pass: Boolean(anonymousSignup.error) && !anonymousSignup.data.user,
  userCreated: Boolean(anonymousSignup.data.user),
});

const phoneSignup = await client.auth.signInWithOtp({
  phone: "+12025550199",
});
results.push({
  case: 6,
  error: safeError(phoneSignup.error),
  name: "phone_signup",
  pass: Boolean(phoneSignup.error) && !phoneSignup.data.user,
  userCreated: Boolean(phoneSignup.data.user),
});

const passCount = results.filter((result) => result.pass).length;
process.stdout.write(`${JSON.stringify({ passCount, results }, null, 2)}\n`);

if (passCount !== results.length) {
  process.exitCode = 1;
}
