# Shortcut data mapping

The request envelope uses ISO 8601 timestamps and explicit units.

| Envelope field               | Source                          | Rule                                                                |
| ---------------------------- | ------------------------------- | ------------------------------------------------------------------- |
| `schemaVersion`              | Fixed Shortcut value            | `health-envelope-v1`                                                |
| `requestId`                  | Random UUID                     | New per HTTP request                                                |
| `idempotencyKey`             | Stable window/device hash input | Same logical export produces same key                               |
| `deviceId`                   | Server-issued UUID              | Must match token credential                                         |
| `exportedAt`                 | Current date/time               | ISO 8601 with offset                                                |
| `windowStart`, `windowEnd`   | Shortcut lookback               | Ordered and bounded                                                 |
| `samples[].metricType`       | Allowlisted mapping             | Reject unknown values                                               |
| `startAt`, `endAt`           | Health sample                   | Preserve source timestamps                                          |
| `numericValue`/category      | Health sample                   | Exactly one compatible value form                                   |
| `unit`                       | Health type                     | Explicit canonical unit                                             |
| `sourceName`, `sourceBundle` | Health metadata                 | Preserve exactly; never infer a total                               |
| `sourceProvider`             | Health metadata when exposed    | Preserve; generic Apple Health is not Garmin                        |
| `sourceDevice`               | Health metadata when exposed    | Name/manufacturer/model/local ID only                               |
| `sourceRecordId`             | Health identifier when present  | Deduplicate only inside source namespace                            |
| `aggregation`                | Shortcut construction           | Daily total, interval delta, session, or point summary              |
| `coverage`                   | Shortcut construction           | Complete, partial, or unknown; confirmed fallback gaps are explicit |

No medication, symptoms, contacts, routes, note text, or unrelated Health fields belong in the envelope. If the actual Shortcut action does not expose a provenance field, omit it or send `null`; do not derive it from Apple Fitness's visible total.
