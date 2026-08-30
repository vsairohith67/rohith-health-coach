# RC6 callback security report

Verified: 2026-08-30

## Controls

- Callback accepts exactly one `code` and at most one `next`.
- Confirmation accepts exactly one `token_hash`, one approved `type`, and at most one `next`.
- Approved confirmation types are email, magic link, invite, and recovery.
- Callback exchanges the code, then calls `getUser()`.
- Confirmation verifies the token hash, then calls `getUser()`.
- Redirect paths must be same-origin root-relative paths.
- Protocol-relative, backslash, control-character, oversized, encoded/double-encoded external, and non-HTTP scheme attacks are rejected.
- URL fragments are removed.
- Invalid/malformed/replayed tokens receive only `/sign-in?status=invalid`; no token, stack, internal exception, or credential is rendered.

## Evidence

- Pure redirect/parameter tests: 12/12 passed.
- Compiled Production runtime attack matrix: 11/11 passed.
- Tested: external `next`, external `redirect`, protocol-relative, double encoded, `javascript:`, `data:`, unexpected parameter, repeated code, external confirmation destination, unsupported confirmation type, and confirmation redirect injection.
- Every runtime attack returned 307 to the same local origin's generic invalid-sign-in page.
- No attack reached the supplied external destination.
- Final URLs contained no submitted token/code.

## Verdict

Callback code gate: **PASS**. A real invitation/recovery link remains untested until hosted private Auth and a synthetic/authorized user exist.
