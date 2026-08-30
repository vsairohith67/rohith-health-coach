import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getAuthCookieOptions,
  getSiteOrigin,
  getSupabasePublicConfig,
} from "./lib/auth/config";
import { isDemoMode } from "./lib/runtime-mode";

const publicPaths = new Set([
  "/sign-in",
  "/auth/callback",
  "/auth/confirm",
  "/manifest.webmanifest",
  "/icon.svg",
  "/sw.js",
]);

function copyCookies(source: NextResponse, destination: NextResponse): void {
  for (const cookie of source.cookies.getAll()) destination.cookies.set(cookie);
}

function privateHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function proxy(request: NextRequest) {
  if (isDemoMode()) return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  const publicPath = publicPaths.has(pathname);
  let response = NextResponse.next({ request });

  try {
    const { url, publishableKey } = getSupabasePublicConfig();
    const supabase = createServerClient(url, publishableKey, {
      cookieOptions: getAuthCookieOptions(),
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    const { data, error } = await supabase.auth.getClaims();
    const authenticated = !error && Boolean(data?.claims?.sub);

    if (pathname === "/sign-in" && authenticated) {
      const redirect = NextResponse.redirect(
        new URL("/today", getSiteOrigin()),
      );
      copyCookies(response, redirect);
      return privateHeaders(redirect);
    }
    if (publicPath) return privateHeaders(response);
    if (!authenticated) {
      if (pathname.startsWith("/api/")) {
        return Response.json(
          { error: "AUTHENTICATION_REQUIRED" },
          {
            status: 401,
            headers: { "cache-control": "private, no-store, max-age=0" },
          },
        );
      }
      const redirect = NextResponse.redirect(
        new URL("/sign-in", getSiteOrigin()),
      );
      copyCookies(response, redirect);
      return privateHeaders(redirect);
    }
    return privateHeaders(response);
  } catch {
    if (publicPath) return privateHeaders(response);
    return Response.json(
      { error: "PRIVATE_AUTH_UNAVAILABLE" },
      {
        status: 503,
        headers: { "cache-control": "private, no-store, max-age=0" },
      },
    );
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
