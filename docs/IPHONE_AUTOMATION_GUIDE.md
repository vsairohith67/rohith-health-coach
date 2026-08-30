# iPhone automation guide

After one successful manual synthetic run:

1. Create a Personal Automation at a low-frequency time when the device is typically online.
2. Run the private Shortcut with “Ask Before Running” enabled during the first week.
3. Confirm that two runs for the same window report duplicates rather than new rows.
4. Confirm offline behavior, then one retry after connectivity returns.
5. Revoke the token and confirm the next run fails with unauthorized without exposing the token.
6. Issue a replacement, update the private Shortcut, and confirm recovery.
7. Only then consider disabling “Ask Before Running.”

Keep payload windows and sample counts bounded. Do not trigger from an emergency/health threshold; this product is not a monitoring service.
