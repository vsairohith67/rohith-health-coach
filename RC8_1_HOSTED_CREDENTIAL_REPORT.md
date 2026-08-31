# RC8.1 hosted credential report

Verified: 2026-08-31

## Scope

The lifecycle matrix ran against the real hosted Supabase project and active `ingest-health` Edge Function. Two fixed `example.invalid` synthetic identities were created through the trusted administrative test path. They received synthetic devices and server-generated credentials only. Every Edge request used an empty `samples` array.

No owner credential was created, no real health record was read or written, and no credential value is present in this report.

## Result: 24/24 passed

| Case | Hosted check                                                                 | Result |
| ---: | ---------------------------------------------------------------------------- | ------ |
|    1 | Unauthenticated issuance denied                                              | Pass   |
|    2 | User A creates its own device                                                | Pass   |
|    3 | User A receives its own ingestion-only credential                            | Pass   |
|    4 | Plaintext is returned only at issuance                                       | Pass   |
|    5 | Later reads return hint and metadata only                                    | Pass   |
|    6 | Database stores HMAC and no plaintext                                        | Pass   |
|    7 | Browser role cannot read private credential rows                             | Pass   |
|    8 | User B cannot see User A device                                              | Pass   |
|    9 | User B cannot issue or rotate for User A device                              | Pass   |
|   10 | Forged user ownership is unavailable/rejected                                | Pass   |
|   11 | Forged device identifier is rejected                                         | Pass   |
|   12 | Valid credential passes Test Connection                                      | Pass   |
|   13 | Test Connection inserts zero health samples                                  | Pass   |
|   14 | Wrong credential is denied                                                   | Pass   |
|   15 | Expired credential is denied                                                 | Pass   |
|   16 | Revoked credential is denied                                                 | Pass   |
|   17 | Rotated-out credential is denied                                             | Pass   |
|   18 | Rotated replacement credential is accepted                                   | Pass   |
|   19 | Two concurrent rotations converge to one active credential                   | Pass   |
|   20 | Device revocation disables every credential                                  | Pass   |
|   21 | Audit metadata contains no plaintext credential                              | Pass   |
|   22 | Edge Function, API, and Vercel application logs contain no tested credential | Pass   |
|   23 | Deleting User A cleans its owned credential state                            | Pass   |
|   24 | Deleting User A does not affect User B                                       | Pass   |

Supporting hosted gates also passed:

- Credential database assertions: 36/36.
- Full RLS matrix: 179/179.
- Live Auth negative matrix: 6/6.
- Concurrent rotation requests: 2; active credentials afterward: 1.
- Test Connection health samples: 0.

## Log-test classification and correction

The first audit implementation supplied the temporary synthetic plaintext values as literals in an administrative SQL search. PostgreSQL statement logging retained that test statement. The match was confined to the administrative database statement: Edge Function, API, authorization-header, and Vercel application log scans had zero matches.

This was a test-harness error, not application logging. The affected value was synthetic, already revoked, then permanently invalidated by deleting the synthetic identity. The evidence method was corrected: future metadata verification checks column design, grants, hints, hashes, and counts without ever supplying plaintext to SQL. A real owner credential must never be queried or compared administratively.

## Cleanup readback

After evidence collection:

- Temporary synthetic Auth identities: 0.
- Temporary sessions: 0.
- Temporary refresh tokens: 0.
- Profiles: 0.
- Devices: 0.
- Ingestion credentials: 0.
- Ingestion events: 0.
- Raw health samples: 0.
- Daily metrics: 0.
- Sleep sessions: 0.
- Activities: 0.
- Audit records: 0.
- Storage objects: 0.
- Existing owner identities: 1.

The Edge Function remains `ACTIVE`. No paid change was made.

Hosted synthetic credential gate: **PASS**. Real device creation and real health ingestion: **NOT STARTED**.
