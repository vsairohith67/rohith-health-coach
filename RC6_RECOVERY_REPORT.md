# RC6 recovery report

The selected Auth model is passwordless email, so there is no public password-reset UI. The shared confirmation endpoint deliberately accepts Supabase's `recovery` type for an administrator-approved account.

## Verified in code/runtime

- Recovery token hash must be present and verified by Supabase.
- A verified current user is required after token exchange.
- Recovery destination uses the same exact internal-path policy as login.
- External, protocol-relative, encoded, double-encoded, `javascript:`, `data:`, unexpected-parameter, and unsupported-type attempts fail to the generic sign-in error.
- Submitted tokens are not retained in the final URL or logs.
- Auth emails/templates are not given health information.

## Not executed

Expired recovery token, cross-user recovery token, and successful one-time recovery were not tested against hosted Auth because public signup is still enabled and there are zero authorized/synthetic users. No email was sent to a real owner.

## Verdict

Recovery code/redirect gate: **PASS**. Hosted recovery lifecycle gate: **NOT PASSED**.
