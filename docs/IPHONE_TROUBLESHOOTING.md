# iPhone troubleshooting

| Safe symptom         | Likely check                                                               |
| -------------------- | -------------------------------------------------------------------------- |
| `unauthorized`       | Token expired/revoked, wrong device, or header missing; do not print token |
| `invalid_schema`     | Shortcut keys/version no longer match the documented envelope              |
| `unsupported_metric` | Remove the non-allowlisted Health type                                     |
| `payload_too_large`  | Reduce lookback/sample count; never raise limits blindly                   |
| `rate_limited`       | Wait for `Retry-After`; remove retry loop                                  |
| `duplicate` counts   | Expected on overlapping windows; idempotency is working                    |
| Missing Health type  | Check iOS permission and whether any source wrote a sample                 |
| Wrong local day      | Confirm phone and profile timezone; server performs final mapping          |

Support captures may include only request ID, timestamp, status, and safe error code. Do not send health samples, tokens, full URLs, or screenshots of Health values.
