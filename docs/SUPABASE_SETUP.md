# Supabase setup

## Local verification

```powershell
pnpm.cmd dlx supabase@2.116.0 start --yes
pnpm.cmd dlx supabase@2.116.0 db reset --local --yes
pnpm.cmd dlx supabase@2.116.0 test db
pnpm.cmd dlx supabase@2.116.0 db lint --local
pnpm.cmd dlx supabase@2.116.0 gen types typescript --local --schema public
```

## Hosted setup gate

Use a dedicated private project in the user’s confirmed organization and region. Review current cost first. Apply migrations in order, verify generated types, disable public signup/invite-only auth, keep Storage private, deploy `ingest-health` with the documented custom credential checks, and set server secrets only in protected platform settings.

Run hosted synthetic User A/User B/anonymous RLS and Storage tests, then security/performance advisors. Browser configuration may contain only the project URL and active publishable key. Secret/service-role keys and peppers are server-only and bypass RLS.

No hosted project existed during RC4 preparation; nothing was created because organization/cost confirmation is mandatory. Hosted reports therefore remain unverified.
