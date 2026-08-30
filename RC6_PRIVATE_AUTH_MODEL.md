# RC6 private Auth model

Selected model: **administrator/owner invitation + passwordless email + no public signup**.

## Rules

- Only an administrator-created/invited user may exist.
- Every passwordless request uses `shouldCreateUser: false`.
- No registration or public onboarding exists.
- Email, Magic Link, invitation, confirmation, and recovery links end at exact allowlisted HTTPS routes.
- Auth messages contain no health information and the UI never confirms whether an address exists.
- The owner address is not stored in Git or reports.

## Email service boundary

No paid/custom SMTP provider was enabled. Supabase documents its built-in sender as best-effort and currently limited to two email-sending requests per hour; the passwordless OTP endpoint is separately rate-limited and repeat requests to one user default to a 60-second window. That is operationally restrictive but adequate for configuration/testing of one private owner. Deliverability has no SLA and must be treated as a pilot limitation.

Supabase's documented default email OTP/Magic Link/invite/recovery lifetime is one hour. The actual hosted value must be read back before pilot clearance.

## Owner onboarding

Status: **READY FOR USER ACTION**.

Required path after public signup and URL configuration pass: Supabase Dashboard → Authentication → Users → Invite/Add User. The owner must complete the genuine email flow and authenticate before the 24-case Production suite.

No owner, fake personal account, custom SMTP, phone provider, social provider, or public signup was created.
