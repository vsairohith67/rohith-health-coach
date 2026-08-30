# RC7 hosted Auth session readback

Verified: 2026-08-31

Sanitized aggregate counts after the owner invitation was accepted:

- Auth users: 1.
- Confirmed users: 1.
- Email identities: 1.
- Sessions: 1.
- Refresh tokens: 1.

No email address, user identifier, access token, refresh token, cookie, or session identifier is recorded here. The invitation link arrived through a URL fragment; that fragment was immediately removed from the browser address by navigation to the clean sign-in URL. A fresh application Magic Link/PKCE callback and server-session validation remain the accepted proof path.
