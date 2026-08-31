# Shortcut data mapping

> RC8 note: JSON wire keys are snake_case. See
> `RC8_IPHONE_SHORTCUT_READY_GUIDE.md` for the exact strict request body and
> the five-metric, Steps-excluded pilot.

The request envelope uses ISO 8601 timestamps and explicit units.

| Envelope field                 | Source                         | Rule                                                                |
| ------------------------------ | ------------------------------ | ------------------------------------------------------------------- |
| `schema_version`               | Fixed Shortcut value           | `1.0`                                                               |
| `x-request-id` header          | Random UUID                    | New per HTTP attempt                                                |
| `x-idempotency-key` header     | Stable window/device input     | Same logical export produces same key                               |
| `device.device_id`             | Server-issued UUID             | Must match the `x-device-id` header and token credential            |
| `exported_at`                  | Current date/time              | ISO 8601 with offset                                                |
| `window.start`, `window.end`   | Shortcut lookback              | Ordered and bounded                                                 |
| `samples[].metric_type`        | Allowlisted mapping            | Reject unknown values                                               |
| `start_at`, `end_at`           | Health sample                  | Preserve source timestamps                                          |
| `numeric_value`/category       | Health sample                  | Compatible value fields; required absent fields remain JSON null    |
| `unit`                         | Health type                    | Explicit canonical unit                                             |
| `source_name`, `source_bundle` | Health metadata                | Preserve exactly; never infer a total                               |
| `source_provider`              | Health metadata when exposed   | Preserve; generic Apple Health is not Garmin                        |
| `source_device`                | Health metadata when exposed   | Name/manufacturer/model/local ID only                               |
| `source_record_id`             | Health identifier when present | Deduplicate only inside source namespace                            |
| `aggregation`                  | Shortcut construction          | Daily total, interval delta, session, or point summary              |
| `coverage`                     | Shortcut construction          | Complete, partial, or unknown; confirmed fallback gaps are explicit |

No medication, symptoms, contacts, routes, note text, or unrelated Health fields belong in the envelope. If the actual Shortcut action does not expose a provenance field, omit it or send `null`; do not derive it from Apple Fitness's visible total.
