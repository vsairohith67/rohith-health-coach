# RC7 hosted public-signup negative test report

Executed: 2026-08-31

Target: the actual hosted Supabase Production project, using synthetic `example.invalid` identities only.

## Result: 6/6 passed

1. Supabase SDK email/password signup was rejected with `signup_disabled`; no user was returned.
2. Raw `/auth/v1/signup` was rejected with HTTP 422 and `signup_disabled`; no user was created.
3. Unknown-email Magic Link with `shouldCreateUser=false` was rejected; no user was created.
4. The application private-login helper returned the same generic response and disclosed no account existence.
5. Anonymous signup was rejected with `anonymous_provider_disabled`; no user was created.
6. Phone OTP signup was rejected with `phone_provider_disabled`; no user was created.

Post-test hosted readback showed exactly the single confirmed owner account and no synthetic Auth residue. The harness redacts synthetic email strings and never prints the Supabase publishable key.
