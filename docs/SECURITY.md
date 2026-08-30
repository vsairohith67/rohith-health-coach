# Security architecture

## Core controls

- All user-data tables use RLS and indexed `user_id` predicates.
- Browser grants are explicit. Derived/canonical health tables are read-only to authenticated clients.
- `anon` has no application-table privileges; public signup is disabled by default.
- Server secrets never use `NEXT_PUBLIC_` names.
- Ingestion and agent credentials are random, hashed at rest, scoped, expiring, revocable, and stored in a private schema.
- FIT Storage is private and path-scoped by owner UUID.
- Security-definer RPCs pin an empty search path, qualify objects, validate identity/ownership, and revoke public execution.
- Logs use safe event codes and short hashes, not bodies, tokens, filenames, GPS, notes, or metric values.

## AI and MCP controls

The query layer is the only health-data path. MCP tools are read-only and allowlisted. OAuth requires PKCE S256, exact redirects, state, issuer/audience checks, expiry, revocation, and least scopes. AI sees aggregate envelopes only; external transfer is off; output is rejected if it invents values/evidence, diagnoses, advises medication, or contains unsafe markup.

## Release controls

Versions and lockfiles are pinned, the FIT base image is digest-pinned, GitHub Actions use commit SHAs, release archives exclude build caches and credential file types, and a content secret scan runs on source and extracted archives.

Report suspected vulnerabilities privately to the owner. Do not include health records, tokens, screenshots of private dashboards, or exploit payloads containing user data.
