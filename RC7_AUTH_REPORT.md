# RC7 hosted Auth report

Verified: 2026-08-31

## Configuration

- Email provider: enabled.
- Public new-user signup: disabled.
- Anonymous sign-in: disabled.
- Phone provider: disabled.
- Social, Web3, and custom providers: disabled.
- Email confirmation: enabled.
- Owner login: passwordless Magic Link.
- Application requests use `shouldCreateUser: false`.
- Access-token expiry: 3,600 seconds.
- Magic Link/OTP expiry: 3,600 seconds.
- Refresh-token replay protection: enabled, with a 10-second reuse interval.
- Session inactivity timeout, timebox, and single-session enforcement are unavailable on the selected Free plan; no paid upgrade was made.

Exact Site URL and redirect evidence is in `RC7_AUTH_URL_REPORT.md`. The six-case hosted public-signup denial is in `RC7_PUBLIC_SIGNUP_TEST_REPORT.md`.

## Owner identity

- Identity label: `OWNER_EMAIL_REDACTED`.
- Auth users: exactly 1 after synthetic cleanup.
- Confirmed owners: exactly 1.
- Provider: email.
- Duplicate owner identity: none.
- Real health rows: 0.

The actual email address, user ID, access/refresh tokens, session IDs, and cookie values are not recorded.

## Advisor note

Supabase Security Advisor reports:

1. `request_account_deletion(text)` is intentionally authenticated-executable and `SECURITY DEFINER`. Live audit confirms owner derivation from `auth.uid()`, an exact scope allowlist, empty `search_path`, schema-qualified access, anonymous denial, and no dynamic SQL.
2. Leaked-password protection is disabled. Supabase documents this as a Pro-plan feature. The real owner flow is passwordless, public signup is disabled, temporary password users were synthetic and deleted, and no paid plan change was made.

Auth gate: **PASS**. Owner global sign-out, zero-session readback, and postsignout denial are recorded separately in `RC7_OWNER_AUTH_REPORT.md`.
