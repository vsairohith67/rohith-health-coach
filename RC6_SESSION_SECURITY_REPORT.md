# RC6 session security report

Verified: 2026-08-30

## Application controls

- Next.js Proxy uses `supabase.auth.getClaims()` to verify the JWT before private page/API access.
- Sensitive Route Handlers use `supabase.auth.getUser()` for a current server-confirmed record.
- Callback and confirmation also call `getUser()` after token/code exchange.
- No authorization decision uses `getSession()`.
- Auth sessions are kept in SSR cookies and refreshed through the Proxy.
- Cookie options are explicit: `Path=/`, `SameSite=Lax`, `HttpOnly=true`, and `Secure=true` in Production.
- Private responses and redirects use `private, no-store, max-age=0`.
- Logout first requests a global session revoke, falls back to local cookie cleanup, redirects to sign-in, and the service worker never caches documents or APIs.

Cookie regression tests: 2/2 passed.

## Hosted configuration/readback

The unauthenticated Auth settings response does not expose JWT lifetime, reuse interval, time-box, inactivity, single-session, or OTP lifetime. An authenticated Dashboard/Management API session was unavailable, so these hosted values were not invented.

Current official defaults/guidance, **not hosted readback**:

- JWT access-token lifetime: one hour.
- Refresh-token reuse interval: ten seconds.
- Refresh tokens rotate and are otherwise single-use.
- Free-plan sessions remain active until sign-out/security action by default; time-box/inactivity/single-session controls require Pro.
- Email OTP/Magic Link/invite/recovery lifetime: one hour.

No plan upgrade or blind default change was made.

## Verdict

Application session/cookie gate: **PASS**. Hosted lifetime readback and authenticated sign-out behavior: **NOT PASSED** pending Dashboard access and owner/synthetic authentication.
