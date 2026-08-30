import { NextResponse } from "next/server";
import { getSiteOrigin } from "../../../lib/auth/config";
import {
  hasOnlyExpectedParameters,
  safeInternalPath,
} from "../../../lib/auth/redirect";
import { createServerSupabaseClient } from "../../../lib/auth/server";

const allowedParameters = new Set(["code", "next"]);

function signInError(): NextResponse {
  return NextResponse.redirect(
    new URL("/sign-in?status=invalid", getSiteOrigin()),
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!hasOnlyExpectedParameters(url.searchParams, allowedParameters)) {
    return signInError();
  }
  const code = url.searchParams.get("code");
  if (!code) return signInError();

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return signInError();
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) return signInError();
    const destination = safeInternalPath(url.searchParams.get("next"));
    return NextResponse.redirect(new URL(destination, getSiteOrigin()));
  } catch {
    return signInError();
  }
}
