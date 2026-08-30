import type { CookieOptionsWithName } from "@supabase/ssr";
import { isDemoMode } from "../runtime-mode";

const LOCAL_ORIGIN = "http://127.0.0.1:3000";

export const AUTH_CALLBACK_PATH = "/auth/callback";
export const AUTH_CONFIRM_PATH = "/auth/confirm";

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export function getAuthCookieOptions(): CookieOptionsWithName {
  return {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
}

function isLoopback(url: URL): boolean {
  return (
    url.protocol === "http:" &&
    (url.hostname === "127.0.0.1" || url.hostname === "localhost")
  );
}

export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) {
    throw new Error("Private authentication is not configured.");
  }

  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && !isLoopback(parsed)) {
    throw new Error("Supabase Auth must use HTTPS outside local development.");
  }

  return { url: parsed.origin, publishableKey };
}

export function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const raw = configured || (isDemoMode() ? LOCAL_ORIGIN : "");
  if (!raw)
    throw new Error("The private Production Site URL is not configured.");

  const parsed = new URL(raw);
  if (
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash ||
    (parsed.protocol !== "https:" && !isLoopback(parsed))
  ) {
    throw new Error("The Site URL must be an exact secure origin.");
  }
  return parsed.origin;
}

export function getAuthCallbackUrl(): string {
  return new URL(AUTH_CALLBACK_PATH, getSiteOrigin()).toString();
}
