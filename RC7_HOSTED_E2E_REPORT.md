# RC7 hosted synthetic end-to-end report

Executed: 2026-08-31 against the real hosted Supabase and Vercel Production infrastructure.

Result: **24/24 passed**.

|   # | Case                        | Result | Evidence                                                                                                    |
| --: | --------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
|   1 | Authorized sign-in          | Pass   | Temporary User A password session created.                                                                  |
|   2 | Unauthorized sign-in        | Pass   | Wrong password rejected without a user/session.                                                             |
|   3 | Public signup               | Pass   | Hosted signup denied; no identity created.                                                                  |
|   4 | User A own profile          | Pass   | Exactly one owner row visible.                                                                              |
|   5 | User A own health data      | Pass   | Own hosted synthetic rows visible.                                                                          |
|   6 | User B isolation            | Pass   | Mutual cross-user reads returned zero.                                                                      |
|   7 | Anonymous denial            | Pass   | Anonymous health access denied/empty.                                                                       |
|   8 | Device creation             | Pass   | User A created and removed an owner-scoped device under RLS.                                                |
|   9 | Ingestion-token creation    | Pass   | Four temporary HMAC credentials created through the trusted service RPC; browser execution remained denied. |
|  10 | Valid ingestion             | Pass   | Valid synthetic device-token request succeeded.                                                             |
|  11 | Invalid token               | Pass   | Rejected with safe 401 response.                                                                            |
|  12 | Revoked token               | Pass   | Rejected with safe 401 response.                                                                            |
|  13 | Duplicate request           | Pass   | Idempotent replay returned without reinsertion.                                                             |
|  14 | Duplicate samples           | Pass   | Canonical sample count remained one.                                                                        |
|  15 | Garmin+iPhone arbitration   | Pass   | 4,861 selected; 8,148 preserved; 13,009 never produced.                                                     |
|  16 | Late sleep update           | Pass   | Canonical synthetic sleep value updated once.                                                               |
|  17 | Partial current day         | Pass   | Accepted as partial and comparison-ineligible.                                                              |
|  18 | Deterministic coach         | Pass   | Repeated generation over hosted-derived state was byte-stable.                                              |
|  19 | Private FIT path            | Pass   | Private FIT Storage matrix passed 21/21.                                                                    |
|  20 | Private export              | Pass   | Owner upload succeeded; User B and anonymous download failed.                                               |
|  21 | Signed export expiry        | Pass   | One-second signed URL failed after expiry.                                                                  |
|  22 | Selective deletion          | Pass   | One User A row removed; separate User B fixture remained; deletion RPC was owner-scoped.                    |
|  23 | Complete synthetic deletion | Pass   | Both temporary users and all linked rows/objects removed.                                                   |
|  24 | Sign-out/postsignout denial | Pass   | Global synthetic sign-out followed by denied private access.                                                |

## Component counts

- RC7 E2E application/API harness: 14/14.
- Hosted RLS red-team matrix: 179/179.
- Private FIT Storage matrix: 21/21.
- Hosted ingestion matrix: 26/26.
- Source-arbitration unit matrix: 12/12.
- Private shell anonymous routes/APIs: 13/13 denied.
- Authenticated Production pages: 10/10.

## Cleanup readback

- Temporary Auth users: 0.
- Temporary sessions: 0.
- Temporary profiles/devices/credentials/events/samples/daily metrics/sleep/activities/reports/exports: 0.
- Temporary Storage objects: 0.
- Remaining real owner identities: 1.
- Remaining health samples across the project: 0.
- Remaining Storage objects across the project: 0.

No real health information, real FIT file, real device token, or phone automation was used.
