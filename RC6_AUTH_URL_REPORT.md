# RC6 Auth URL report

Verified: 2026-08-30

## Verified Vercel origin

- Intended exact Production origin: `https://rohith-health-coach.vercel.app`.
- Vercel project readback confirms that domain belongs to `rohith-health-coach`.
- Its current target is the earlier Demo-only deployment and is not accepted as the private Production shell.

## Required Supabase URL configuration

- Site URL: `https://rohith-health-coach.vercel.app`
- Production callback: `https://rohith-health-coach.vercel.app/auth/callback`
- Production confirmation/recovery: `https://rohith-health-coach.vercel.app/auth/confirm`
- Local callback: `http://localhost:3000/auth/callback`
- Local confirmation/recovery: `http://localhost:3000/auth/confirm`
- Preview callbacks: none.
- Wildcards: none.

Application code accepts only a configured exact origin, requires HTTPS outside loopback, and generates an exact callback URL.

## Hosted readback

The current hosted Site URL and redirect allowlist could not be read or changed without an authenticated Dashboard session or Management API authorization. Therefore no claim is made that broad wildcards are absent in the hosted setting.

## Verdict

Code-side URL gate: **PASS**. Hosted URL configuration/readback gate: **NOT PASSED**.
