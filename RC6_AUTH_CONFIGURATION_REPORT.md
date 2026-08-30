# RC6 hosted Auth configuration report

Verified: 2026-08-30

Project: `rohith-health-coach-prod` (`wmzrkkqcfvuhjpduplod`)

## Public settings readback

| Setting                | Previous | Current readback                     | Required |
| ---------------------- | -------- | ------------------------------------ | -------- |
| Email authentication   | enabled  | enabled                              | enabled  |
| Public new-user signup | enabled  | **enabled** (`disable_signup=false`) | disabled |
| Email auto-confirm     | disabled | disabled                             | disabled |
| Anonymous Auth         | disabled | disabled                             | disabled |
| Phone Auth             | disabled | disabled                             | disabled |
| Social providers       | disabled | disabled                             | disabled |

The readback came from the documented hosted Auth settings endpoint using the browser-safe publishable key. No secret key was used or recorded.

## Attempted official mechanisms

- The connected Supabase project tool exposes database, Storage, functions, logs, and advisors but not Auth configuration.
- Supabase CLI 2.116.0 has no authenticated platform token in this workspace.
- The official Management API requires an owner PAT/OAuth authorization with Auth-write scope; none is available.
- The in-app Supabase Dashboard is at its sign-in page, so an authenticated Dashboard mutation could not be completed.
- No undocumented endpoint, secret extraction, payment change, or permission bypass was attempted.

## Defense in depth already active

The application hard-codes `shouldCreateUser: false`, has no public signup UI, returns enumeration-safe feedback, and keeps `ENABLE_PUBLIC_SIGNUP=false` as the required Production value.

## Owner account

**OWNER ACCOUNT — READY FOR USER ACTION**

After the hosted configuration is corrected, use Supabase Dashboard → Authentication → Users → Invite/Add User. Do not place the owner address in source, reports, trackers, screenshots, or fixtures. Completion must be based on the real invitation and successful owner authentication, never an invented address.

## Verdict

Hosted Auth configuration gate: **FAIL / USER ACTION REQUIRED**. Production deployment and direct public-signup probes remain stopped while `disable_signup=false`.
