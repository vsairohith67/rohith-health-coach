# RC7 owner authentication report

Verified: 2026-08-31

Identity: `OWNER_EMAIL_REDACTED`.

## Private login flow

1. The owner entered the intended email through the private application flow.
2. The deployed form submitted by POST and did not retain the address in the URL.
3. The application requested a passwordless link with `shouldCreateUser: false`.
4. The generic response disclosed no account existence.
5. The owner received and opened the new Magic Link.
6. The callback created a server-recognized session.
7. `/today` became accessible.
8. Ten authenticated private routes rendered successfully.
9. The shell showed `Private Production`, `No data connected`, and no Demo or health values.
10. AI, phone automation, and Garmin cloud remained visibly Off.

## Route results

- Authenticated: 10/10 private pages passed.
- Anonymous: 11/11 private pages redirected to `/sign-in`.
- Anonymous private APIs: 2/2 returned HTTP 401.
- PWA manifest remained publicly accessible as intended.

## Sign-out

The two-user hosted synthetic flow executed global sign-out and post-signout denial successfully. The final owner browser sign-out/revocation check is completed only after the required action-time confirmation; no session value is recorded here.

No health information was connected. No owner address, token, cookie, user ID, or session ID is present in this report.
