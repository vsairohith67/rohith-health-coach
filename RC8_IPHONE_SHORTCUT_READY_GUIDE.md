# RC8 iPhone Shortcut ready guide

Prepared: 2026-08-31

Shortcut name: **Sync Rohith Health — Daily**

Status: **READY TO BUILD MANUALLY AFTER THE RC8 CREDENTIAL FIX IS DEPLOYED**

This guide is derived from `supabase/functions/ingest-health/index.ts` and its deployed snake_case contract. It does not contain a credential or health value. Do not build or run it while the owner is away.

## RC8 boundary

Include only:

- Sleep Analysis
- Active Energy
- Resting Energy
- Walking + Running Distance
- Workouts

Exclude Steps, raw heart rate, resting heart rate, HRV, Pulse Ox, GPS/routes, notes, medication, symptoms, clinical records, body measurements, water, and FIT files. Steps stay excluded even if the separate source diagnostic succeeds. The lookback is the previous **48 hours**. Run manually only; do not create an automation.

## Values to enter later on the iPhone

- `DEVICE_ID`: `<DEVICE_ID_FROM_ONE_TIME_PRODUCTION_ISSUANCE>`
- `DEVICE_INGESTION_TOKEN`: `<DEVICE_INGESTION_TOKEN_FROM_ONE_TIME_PRODUCTION_ISSUANCE>`

The RC8 issuer deliberately sets the device's external identifier to the same UUID as `DEVICE_ID`, so the same placeholder is used in the header and JSON body. Keep the token in the private Shortcut on the iPhone only. Never paste it into Git, Codex, ChatGPT, email, Notes, screenshots, notifications, logs, or a shared iCloud Shortcut.

## Exact endpoint and headers

Use this exact HTTPS endpoint with no query string:

`https://wmzrkkqcfvuhjpduplod.supabase.co/functions/v1/ingest-health`

`Get Contents of URL` must use `POST`, request body `JSON`, and these headers:

| Header              | Exact value                       |
| ------------------- | --------------------------------- |
| `Authorization`     | `Bearer <DEVICE_INGESTION_TOKEN>` |
| `Content-Type`      | `application/json`                |
| `x-device-id`       | `<DEVICE_ID>`                     |
| `x-idempotency-key` | Stable key described below        |
| `x-request-id`      | A new UUID for this HTTP attempt  |

Never place the token in the URL or JSON body. Do not use a URL shortener or alternate host.

## Exact JSON envelope

The top-level request must contain only these keys:

```json
{
  "schema_version": "1.0",
  "export_id": "<UUID_FOR_THIS_LOGICAL_EXPORT>",
  "exported_at": "<ISO_8601_WITH_OFFSET>",
  "timezone": "Asia/Kolkata",
  "device": {
    "device_id": "<DEVICE_ID>",
    "device_name": "Rohith iPhone",
    "source": "apple_shortcut",
    "shortcut_version": "1.0.0"
  },
  "window": {
    "start": "<NOW_MINUS_48_HOURS_ISO_8601_WITH_OFFSET>",
    "end": "<NOW_ISO_8601_WITH_OFFSET>"
  },
  "samples": []
}
```

Do not use the older `health-envelope-v1`, `schemaVersion`, `requestId`, `deviceId`, `windowStart`, or `metricType` names. They are not accepted by the deployed strict schema.

Each sample must contain only this shape. Build the template as a JSON `Text` action, then use `Get Dictionary from Input`; this preserves the required JSON `null` values that are awkward to create directly in a Dictionary action.

```json
{
  "metric_type": "",
  "start_at": "",
  "end_at": "",
  "numeric_value": null,
  "text_value": null,
  "category_value": null,
  "unit": null,
  "source_name": "",
  "source_bundle": null,
  "source_record_id": null,
  "source_provider": null,
  "source_device": null,
  "aggregation": "interval_delta",
  "coverage": {
    "state": "unknown",
    "current_day": false,
    "fallback_gap_confirmed": false
  },
  "metadata": {}
}
```

Do not remove the required nullable keys. `source_provider`, `source_device`, `aggregation`, and `coverage` are optional to the server, but the template includes them so provenance absence is explicit.

## Build actions in order

1. In Shortcuts, create a new shortcut named **Sync Rohith Health — Daily**. Do not enable “Show in Share Sheet” and do not create a Personal Automation.
2. Add two private `Text` actions at the top for `<DEVICE_ID>` and `<DEVICE_INGESTION_TOKEN>`. Rename their variables `DeviceID` and `DeviceToken`. Enter the real values only after the credential is issued in Production.
3. Add `Current Date`; save it as `WindowEnd`.
4. Add `Adjust Date`, subtract 48 hours from `WindowEnd`; save it as `WindowStart`.
5. Format `WindowStart`, `WindowEnd`, and a fresh `Current Date` with an ISO 8601 format that includes the numeric offset. A custom format such as `yyyy-MM-dd'T'HH:mm:ssXXX` is acceptable only after Quick Look confirms output resembling `2026-08-31T12:30:00+05:30`.
6. Add `Generate UUID`; save it as `ExportID`. Add a second `Generate UUID`; save it as `RequestID`.
7. Create `IdempotencyKey` as the exact stable text `rc8|DeviceID|WindowStartISO|WindowEndISO|1.0`. Reuse the same four values if retrying that logical export. Never include `DeviceToken`.
8. Add an empty `List` and save it as `Samples`.
9. Add one collection block for each of the five allowed Health types below. Use `Find Health Samples` or its current iOS equivalent, with Start Date at or after `WindowStart`, Start Date before `WindowEnd`, oldest first, and limit 1,001. If a block returns 1,001 items, stop without uploading; the result may be truncated.
10. In each block, use `Repeat with Each`. Read Start Date, End Date, Value/category, Source, and Device only through `Get Details of Health Samples`, the Health Sample variable's detail picker, or the current equivalent. Do not parse the displayed description of a sample.
11. For each Repeat Item, parse the sample JSON template above with `Get Dictionary from Input`, then use `Set Dictionary Value` for the exact fields in the metric table. Add the completed Dictionary to `Samples` with `Add to Variable`.
12. After all five blocks, use `Count` on `Samples`. If the count exceeds 1,800, stop without uploading. The server maximum is 2,000; the lower Shortcut limit leaves safety margin.
13. Build the exact top-level Dictionary shown above, using `Samples` as the list value.
14. Convert a copy of the request Dictionary to JSON text, Base64 Encode it, and count Base64 characters. If the Base64 text exceeds 600,000 characters, stop without uploading. This keeps the original request below roughly 450 kB, under the server's 500,000-byte limit. Send the original Dictionary, not the Base64 copy.
15. Add the exact URL, `Get Contents of URL`, `POST`, JSON, and five headers from this guide.
16. On first run, iOS will request access to the selected Health types and network destination. Review the list and allow only the five RC8 types. Do not grant access to excluded categories.
17. Treat only an HTTP success response with `ok = true` as success. Show only a generic “Sync completed” message. Do not show sample values, the request body, token, device ID, or full response in a notification.
18. Leave the Shortcut manual. Do not add a time-of-day, charging, sleep, app, or background automation in RC8.

Apple documents that Shortcuts can find Health Samples, repeat over returned items, build nested JSON dictionaries, and send JSON with `Get Contents of URL`. Apple's public guide does not guarantee which provenance details every iOS build or Health record exposes, so source fields must be checked on the actual phone rather than invented.

## Metric mapping

| Health query                            | `metric_type`              | Value fields                                                                                  | `unit` | `aggregation`    |
| --------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------- | ------ | ---------------- |
| Sleep Analysis                          | `sleep_analysis`           | exact stage/category in `category_value`; keep numeric/text null                              | null   | `interval_delta` |
| Active Energy or Active Energy Burned   | `active_energy`            | converted numeric value in `numeric_value`; other value fields null                           | `kcal` | `interval_delta` |
| Resting Energy or Resting Energy Burned | `resting_energy`           | converted numeric value in `numeric_value`; other value fields null                           | `kcal` | `interval_delta` |
| Walking + Running Distance              | `walking_running_distance` | converted numeric value in `numeric_value`; other value fields null                           | `km`   | `interval_delta` |
| Workouts                                | `workout`                  | elapsed Start-to-End minutes in `numeric_value`; activity type in `category_value`; text null | `min`  | `session_total`  |

Use the Health sample's exact Start Date and End Date. For workouts, calculate elapsed minutes from those dates if the current detail action does not expose a clearly unit-qualified duration. Never include a route or location.

## Provenance mapping

For every sample:

- `source_name`: exact Source/Source Name detail when exposed. If the field is absent or empty, use the literal `Apple Health source unavailable`; this explicitly records uncertainty and does not claim Garmin, iPhone, or Apple Watch provenance.
- `source_bundle`: exact bundle identifier only if the current detail picker exposes it; otherwise leave null.
- `source_record_id`: exact stable record identifier only if exposed; otherwise leave null. Never construct one from the value or timestamp.
- `source_provider`: exact provider field only if exposed; otherwise leave null. Do not infer Garmin from an Apple Fitness total.
- `source_device`: when exact device details are exposed, use an object with all four keys: `name`, `manufacturer`, `model`, and `local_identifier`, using null for unavailable members. Otherwise leave the whole field null.
- `metadata`: include only `health_type` and `provenance_status` (`exposed` or `source_unavailable`). Do not add route, note, GPS, contact, or health values.
- `coverage.state`: `unknown` for RC8 because a 48-hour query does not prove a source supplied complete coverage.
- `coverage.current_day`: true only when the sample's local date is the current `Asia/Kolkata` date.
- `coverage.fallback_gap_confirmed`: always false in this Shortcut. It must never claim a source gap merely because no sample was returned.

Preserving `Apple Health source unavailable` is safer than guessing. Ambiguous records may remain unavailable for analytics.

## Connection-only test before Health access

After the Production fix is deployed and the owner has copied the one-time credential to the iPhone, make the first manual request with the exact envelope above and an empty `samples` list. Use a one-minute window, not 48 hours. This tests credential/device binding without reading Apple Health.

Expected safe response fields are `ok`, `request_id`, `ingestion_event_id`, `received`, `inserted`, `updated`, `duplicates`, `rejected`, `conflicts`, and `affected_dates`. For the empty test, `received`, `inserted`, `updated`, `duplicates`, `rejected`, and `conflicts` must all be 0 and `affected_dates` must be empty.

Then stop. The first real Health run is outside unattended preparation.

## Failure handling

- 401: stop; do not retry. Confirm the device ID or revoke/replace the credential.
- 409: stop and retain only the safe request ID for diagnosis.
- 413: stop; reduce the payload without silently dropping a metric.
- 422: stop; correct the field, timestamp, metric, or unit contract.
- 503: stop; the hosted service is not configured.
- Network error: allow one manual retry with the same export ID and idempotency key.

Never Quick Look, copy, share, or log the request after the real token or Health samples are present. Reset the Shortcut's privacy permissions if the pilot is abandoned.

## Official Apple references

- https://support.apple.com/guide/shortcuts/-apd3c845e881/ios
- https://support.apple.com/guide/shortcuts/apdc11deb2c1/ios
- https://support.apple.com/guide/shortcuts/intro-to-using-json-apd0f2e057df/ios
- https://support.apple.com/guide/shortcuts/apd58d46713f/ios
- https://support.apple.com/guide/shortcuts/apd961a4fc65/ios
