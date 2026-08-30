"use server";

import { z } from "zod";
import { getAuthCallbackUrl } from "../../lib/auth/config";
import {
  PRIVATE_SIGN_IN_RESPONSE,
  requestPrivateSignInLink,
} from "../../lib/auth/private-login";
import { createServerSupabaseClient } from "../../lib/auth/server";
import { isDemoMode, isPublicSignupEnabled } from "../../lib/runtime-mode";

export type SignInState = { message: string };

const emailSchema = z.email().max(254);

export async function requestSignInLink(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success || isDemoMode() || isPublicSignupEnabled()) {
    return { message: PRIVATE_SIGN_IN_RESPONSE };
  }

  try {
    const supabase = await createServerSupabaseClient();
    return {
      message: await requestPrivateSignInLink(
        supabase,
        parsed.data,
        getAuthCallbackUrl(),
      ),
    };
  } catch {
    return { message: PRIVATE_SIGN_IN_RESPONSE };
  }
}
