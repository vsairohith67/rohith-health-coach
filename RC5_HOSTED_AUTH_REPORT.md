# RC5 hosted Auth report

Verified: 2026-08-30 against Supabase project `wmzrkkqcfvuhjpduplod`.

## Confirmed configuration

- Anonymous Auth identities: disabled by the hosted Auth settings endpoint.
- Phone Auth: disabled.
- Social providers: disabled.
- Email confirmation: enabled; auto-confirm is disabled.
- No real owner account was created.
- No personal login email was invented.
- Two clearly synthetic password identities were created only for Storage API testing and deleted immediately afterward.
- Final synthetic-identity count: 0.

## Unresolved production requirements

The hosted settings read-back reports `disable_signup: false`, so public email signup is currently enabled. The connected Supabase management tools do not expose Auth configuration, and the available browser session is not authenticated to the Supabase dashboard. Therefore the following settings could not be safely changed or fully read back:

- public email signup off
- final production Site URL and callback allowlist
- exact localhost callback
- exact Vercel production callback
- preview callback only if later required
- recovery redirect allowlist
- session expiry policy
- secure-cookie behavior in the deployed application

No broad callback wildcard was added.

## Required user action

**READY FOR USER ACTION**

Sign in to the Supabase dashboard for `rohith-health-coach-prod`, disable new-user signup, and keep anonymous sign-in disabled. Allow only `http://localhost:3000/auth/callback`, `https://rohith-health-coach.vercel.app/auth/callback`, and the exact RC5 Preview callback if Preview login is genuinely needed; do not add a broad wildcard. Then read back the callback, recovery, session-expiry, and cookie settings. Do not create the private owner account until those settings are verified.

Result: hosted Auth is not yet an approved production gate. Production deployment and real-data readiness remain blocked.
