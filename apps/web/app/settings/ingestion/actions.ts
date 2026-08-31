"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "../../../lib/auth/server";
import { isDemoMode } from "../../../lib/runtime-mode";

export type CredentialIssueState =
  | { status: "idle"; message: "" }
  | { status: "error"; message: string }
  | {
      status: "issued";
      message: string;
      deviceId: string;
      token: string;
      tokenHint: string;
      expiresAt: string;
    };

export type CredentialMutationState = {
  status: "idle" | "error" | "success";
  message: string;
};

const deviceNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .refine((value) =>
    [...value].every((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint > 31 && codePoint !== 127;
    }),
  );
const deviceIdSchema = z.uuid();
const issuedCredentialSchema = z
  .object({
    device_id: z.uuid(),
    token: z.string().regex(/^[0-9a-f]{64}$/),
    token_hint: z.string().regex(/^\.\.\.[0-9a-f]{6}$/),
    expires_at: z.iso.datetime({ offset: true }),
  })
  .strict();

const GENERIC_ERROR =
  "The private credential operation could not be completed. Refresh and try again.";

async function getAuthenticatedClient() {
  if (isDemoMode()) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return supabase;
}

function parseIssuedCredential(data: unknown): CredentialIssueState {
  const candidate = Array.isArray(data) ? data[0] : data;
  const parsed = issuedCredentialSchema.safeParse(candidate);
  if (!parsed.success) return { status: "error", message: GENERIC_ERROR };
  return {
    status: "issued",
    message:
      "Credential created. Copy it to the iPhone now; it cannot be displayed again.",
    deviceId: parsed.data.device_id,
    token: parsed.data.token,
    tokenHint: parsed.data.token_hint,
    expiresAt: parsed.data.expires_at,
  };
}

export async function createIphoneIngestionCredential(
  _previous: CredentialIssueState,
  formData: FormData,
): Promise<CredentialIssueState> {
  const name = deviceNameSchema.safeParse(formData.get("device_name"));
  if (!name.success) {
    return {
      status: "error",
      message: "Enter a device name of 1–80 characters.",
    };
  }

  try {
    const supabase = await getAuthenticatedClient();
    if (!supabase) return { status: "error", message: GENERIC_ERROR };
    const { data, error } = await supabase.rpc("create_ingestion_credential", {
      p_device_name: name.data,
    });
    if (error) return { status: "error", message: GENERIC_ERROR };
    const state = parseIssuedCredential(data);
    if (state.status === "issued") revalidatePath("/settings/ingestion");
    return state;
  } catch {
    return { status: "error", message: GENERIC_ERROR };
  }
}

export async function rotateIphoneIngestionCredential(
  _previous: CredentialIssueState,
  formData: FormData,
): Promise<CredentialIssueState> {
  const deviceId = deviceIdSchema.safeParse(formData.get("device_id"));
  if (!deviceId.success) return { status: "error", message: GENERIC_ERROR };

  try {
    const supabase = await getAuthenticatedClient();
    if (!supabase) return { status: "error", message: GENERIC_ERROR };
    const { data, error } = await supabase.rpc("rotate_ingestion_credential", {
      p_device_id: deviceId.data,
    });
    if (error) return { status: "error", message: GENERIC_ERROR };
    const state = parseIssuedCredential(data);
    if (state.status === "issued") revalidatePath("/settings/ingestion");
    return state;
  } catch {
    return { status: "error", message: GENERIC_ERROR };
  }
}

export async function revokeIphoneIngestionDevice(
  _previous: CredentialMutationState,
  formData: FormData,
): Promise<CredentialMutationState> {
  const deviceId = deviceIdSchema.safeParse(formData.get("device_id"));
  if (!deviceId.success) return { status: "error", message: GENERIC_ERROR };

  try {
    const supabase = await getAuthenticatedClient();
    if (!supabase) return { status: "error", message: GENERIC_ERROR };
    const { data, error } = await supabase.rpc("revoke_ingestion_device", {
      p_device_id: deviceId.data,
    });
    if (error || data !== true) {
      return { status: "error", message: GENERIC_ERROR };
    }
    revalidatePath("/settings/ingestion");
    return { status: "success", message: "Device credential revoked." };
  } catch {
    return { status: "error", message: GENERIC_ERROR };
  }
}
