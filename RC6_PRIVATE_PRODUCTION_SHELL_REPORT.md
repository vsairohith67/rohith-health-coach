# RC6 private Production shell report

Verified: 2026-08-30

## Compiled local Production runtime

The app was built and started with explicit `DEMO_MODE=false`, `ENABLE_PUBLIC_SIGNUP=false`, an exact local Site URL, and non-secret local Auth placeholders.

- Today denied: pass, 307 to sign-in.
- Trends denied: pass.
- Sleep denied: pass.
- Heart denied: pass.
- Activity denied: pass.
- Coach denied: pass.
- Data Sources denied: pass.
- Imports denied: pass.
- Settings denied: pass.
- Raw API denied: pass, 401 `AUTHENTICATION_REQUIRED`.
- Private/no-store headers: pass for all ten checks.
- Sign-in page: noindex, private-access label, no Demo Mode entry.

Unauthenticated matrix: **10/10 passed**.

Static Production output contains “No health records are connected” and “Private Production”; it contains no Demo label and neither the `4,861` nor `13,009` fixture value.

An omitted `DEMO_MODE` runtime variable correctly falls back to synthetic Demo Mode. Therefore the explicit false value is mandatory in Vercel Production; the Demo fallback cannot access real records and is not accepted as a Production configuration.

## Hosted/authenticated checks

Authenticated empty-shell, global logout, post-logout denial, and browser-cache behavior were not run against hosted Production because no RC6 Production deployment or authorized account exists. Source controls clear service-worker caches on sign-out and never cache documents or APIs.

## Verdict

Compiled unauthenticated shell gate: **PASS**. Hosted authenticated shell gate: **NOT RUN**.
