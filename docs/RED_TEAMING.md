# Red teaming

Test categories:

- Cross-user and anonymous database/Storage access; forged ownership; excessive grants/RPC execute.
- Token replay, expiry, revocation, wrong device/scope, rate/size/idempotency abuse.
- Truncated/spoofed/oversized/CRC-invalid FIT; malicious decoder output/path; missing SDK/hash.
- MCP missing/expired/revoked scope, invalid range, bulk extraction, unknown tool, public bind.
- OAuth state/PKCE/redirect/issuer/audience/expiry/revocation failures.
- Prompt injection, evidence/number fabrication, diagnosis/medication, causal certainty, panic/shame, unsafe markup, too many actions, another-person data.
- PWA offline cache leakage and private response persistence.
- Archive secret/record/model/binary leakage.

Automated local results are in `RED_TEAM_REPORT.md`. Hosted/provider/real-device exercises remain blocked and must use synthetic identities/data first.
