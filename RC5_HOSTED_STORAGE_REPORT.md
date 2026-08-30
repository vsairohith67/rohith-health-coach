# RC5 hosted Storage report

Verified: 2026-08-30 through the actual hosted Supabase Auth and Storage APIs using two temporary synthetic users.

## Configuration

- Bucket: `fit-private`
- Public: `false`
- File limit: 25 MiB
- Allowed MIME type: `application/octet-stream`
- Owner policy: authenticated user ID must match both the first object-path segment and `storage.objects.owner_id`
- Public export bucket: not created because the repository does not define one; export metadata remains private and no export feature was activated.

## Hosted API matrix

Result: **21 passed, 0 failed**.

The checks covered:

- Test User A and Test User B password sign-in
- each user uploading and downloading an own synthetic object
- mutual cross-user download denial
- anonymous download denial
- guessed object-path denial
- own-prefix listing and cross-prefix invisibility
- unsafe parent-path rejection
- own signed-URL creation
- cross-user and anonymous signed-URL denial
- initial signed-URL use
- signed-URL expiration
- cross-user deletion denial
- each owner deleting their own object

Supabase intentionally rejects direct deletion from `storage.objects`; deletion was therefore tested through the supported Storage API. The signed URL used a one-second lifetime and failed after expiry. No URL, access token, password, or object bytes were recorded in this report.

## Cleanup

- synthetic users deleted: 2
- synthetic Storage objects remaining: 0
- profiles remaining: 0
- raw health samples remaining: 0
- export jobs remaining: 0

Only a small synthetic non-FIT byte fixture was uploaded. No real FIT file or health information was used.

Result: private FIT Storage API gate passes. Temporary-export implementation remains unactivated and must be tested if a production export worker is added.
