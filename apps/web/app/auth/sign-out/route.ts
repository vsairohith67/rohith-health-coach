import { NextResponse } from "next/server";
import { getSiteOrigin } from "../../../lib/auth/config";
import { createServerSupabaseClient } from "../../../lib/auth/server";

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) await supabase.auth.signOut({ scope: "local" });
  } catch {
    // The redirect below remains fail-closed. The global call normally clears
    // the current cookie and revokes refresh tokens; local cleanup is the
    // bounded fallback when the hosted revoke request is unavailable.
  }
  return NextResponse.redirect(new URL("/sign-in", getSiteOrigin()), 303);
}
