# RC6 Auth code audit

Audited: 2026-08-30

## Before RC6

- The sign-in page rendered an inert form.
- The callback route redirected without exchanging or validating a code.
- Private pages and raw application APIs had no Production Auth boundary.
- Production pages could render deterministic Demo records.

## Search result

The Production source contains no `signUp()`, `signInWithPassword()`, `resetPasswordForEmail()`, or server authorization based on `getSession()`. The only login creation call is `signInWithOtp()`; it is wrapped by the private-login boundary.

## Implemented controls

- `signInWithOtp()` always sends `shouldCreateUser: false`.
- Invalid, unknown, rate-limited, and authorized addresses all receive the same message: “If this email is authorized, a sign-in link will be sent.”
- The Production sign-in page has no Sign up, Create account, Register, Join, Get started, or Demo Mode entry point.
- The Server Action refuses to call Auth when Demo Mode is active or `ENABLE_PUBLIC_SIGNUP` is true.
- `/auth/callback` exchanges the PKCE code and then validates the user.
- `/auth/confirm` verifies only approved email token types and then validates the user.
- Production page access is protected by verified claims in the Next.js Proxy; sensitive APIs also obtain a current user record.
- Production pages render an empty private shell, not Demo records.
- Logout attempts a global revoke and uses local cookie cleanup as a bounded fallback.

## Automated evidence

- Private-login tests: 2/2 passed, including explicit `shouldCreateUser: false` and enumeration-safe feedback.
- Redirect/callback pure tests: 12/12 passed.
- Cookie hardening tests: 2/2 passed.
- Full unit/integration suite: 282/282 passed across 17 files.
- Hosted-backed local UI attempt with a synthetic unknown `.invalid` address returned generic feedback; exact hosted Auth user count remained zero.

## Verdict

Application code gate: **PASS**. Dashboard/backend public signup remains a separate mandatory hosted gate.
