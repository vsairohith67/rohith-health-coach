# RC7 hosted Auth session readback

Verified: 2026-08-31

## Authenticated readback

- Auth users: 1.
- Confirmed users: 1.
- Email identities: 1.
- A fresh application Magic Link/PKCE callback created a server-recognized owner session.
- Ten authenticated private routes passed while the session was active.

## Final global sign-out readback

- Auth users retained: 1.
- Active sessions: 0.
- Refresh tokens: 0.
- A direct post-signout `/today` request redirected to `/sign-in`.

No email address, user identifier, access token, refresh token, cookie, or session identifier is recorded here. The earlier invitation fragment was removed from the address before the accepted fresh Magic Link/PKCE proof flow.
