# Release notes — 1.0.0-rc6

RC6 implements the private Auth application boundary: passwordless login cannot auto-create unknown users, login feedback does not enumerate accounts, callback and confirmation routes validate credentials and reject open redirects, server authorization uses verified claims/current users, and Production cookies are Secure, HttpOnly, SameSite=Lax, and path-scoped.

The compiled Production shell denies nine private pages and raw APIs when unauthenticated, never renders Demo fixtures, never caches private documents/APIs, and keeps AI, MCP, phone automation, Garmin cloud, and real data disabled. The source gate passed 282 unit/integration assertions, 55 database tests, five FIT tests, 222 evaluation assertions, and 16 Playwright cases.

Hosted Supabase still reports `disable_signup=false`. The supported Dashboard/Management API mutation was unavailable without owner authentication, so the direct signup probes, exact Auth URL readback, owner invitation, Vercel Production deployment, and 24-case Production E2E remain correctly stopped. RC6 is therefore a sanitized partial security release, not real-data clearance.
