# iPhone automation

Use a conservative schedule: one manual morning sync while piloting, then at most a few bounded automations per day. Avoid continuous background extraction.

- Trigger only when the phone is unlocked and network access is available where practical.
- Query a short lookback to catch delayed Health writes; the server’s hashes/idempotency prevent duplicates.
- Keep the Shortcut silent on success. Notifications may say “sync completed/failed” but must not include health values.
- Use a single retry with backoff for network failures. Do not retry 401/403; revoke or repair the credential.
- Stop after repeated schema/validation failures and inspect only safe codes.
- Disable the automation before sharing the phone/Shortcut or during incident response.

Real-device automation remains unverified in RC4. Follow `IPHONE_AUTOMATION_GUIDE.md` and record the synthetic pilot before enabling real records.
