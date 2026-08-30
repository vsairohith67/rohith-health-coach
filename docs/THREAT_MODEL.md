# Threat model

## Protected assets

Health observations and aggregates, wellbeing notes, location-bearing activity records, FIT objects, credentials, sessions, exports, account-deletion state, and the integrity of deterministic findings.

## Primary threats and mitigations

| Threat                              | Mitigation                                                                              | Residual gate                               |
| ----------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------- |
| Cross-user/BOLA access              | Explicit grants, owner RLS, two-user pgTAP tests                                        | Repeat on hosted project                    |
| Leaked service key                  | Server-only variables, scanner, no logs/bundles                                         | Configure through host secret managers      |
| Stolen ingestion token              | Hash-only storage, scope, expiry, revocation, rate limit, idempotency                   | Hosted lifecycle test                       |
| Public FIT object                   | Private bucket, owner path policy, signed access                                        | Hosted Storage test                         |
| Malicious FIT file/decoder          | Size/signature/CRC checks, temp file, no shell, pinned adapter hash, non-root container | Official decoder install and corpus fuzzing |
| Prompt injection in notes/tool text | Notes/GPS excluded, untrusted delimiting, no tool recursion, strict output schema       | Model-specific red team after installation  |
| Data exfiltration through AI        | Aggregate allowlist, default-off providers, local-only URL enforcement                  | Explicit consent and provider review        |
| OAuth code/token theft              | PKCE S256, state, exact redirect, short expiry, rotation/revocation                     | Real provider conformance test              |
| MCP tool abuse                      | Read-only allowlist, least scopes, range/point caps, audit codes                        | Private ChatGPT/Codex connection test       |
| Dependency/supply-chain compromise  | Locks, exact versions/digests, CI action SHAs, archive scan                             | Ongoing update review                       |

Out of scope for software-only RC4: physical device compromise, compromised hosting administrator, legal/compliance certification, clinical decision support, and zero-day flaws in cloud providers or wearable firmware.
