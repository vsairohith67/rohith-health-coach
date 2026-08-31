# RC7 private Production shell report

Verified: 2026-08-31 against `https://rohith-health-coach.vercel.app`.

## Anonymous boundary

- `/`, `/today`, `/trends`, `/sleep`, `/heart`, `/activity`, `/reports`, `/upload`, `/check-in`, `/settings`, and `/settings/ai`: 11/11 redirected to `/sign-in`.
- `/api/health` and `/api/ask`: 2/2 returned HTTP 401.
- `/manifest.webmanifest`: HTTP 200, intentionally public static metadata.

## Authenticated shell

- `/today`, `/trends`, `/sleep`, `/heart`, `/activity`, `/reports`, `/upload`, `/check-in`, `/settings`, and `/settings/ai`: 10/10 accessible to the owner session.
- No Demo Mode label or deterministic Demo health values appeared.
- The shell displayed a private zero-data state and did not render missing values as zero.
- AI, phone automation, and Garmin cloud were Off.

## Client and cache safety

- Eight deployed JavaScript assets, 576,579 characters total, were scanned.
- Forbidden server-secret marker hits: 0.
- Service-worker private API/data cache marker hits: 0.
- Production and Supabase logs contained no tested raw-health markers or bearer/device-token material.

Result: private Production shell gate **PASS**.
