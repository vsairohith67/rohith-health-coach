# Garmin API future

Garmin Health/Activity APIs are future integrations, not enabled RC4 features. Do not scrape Garmin Connect or request consumer credentials as a workaround.

A future release must obtain official program approval, document terms/costs/data types/webhooks/deletion, isolate OAuth secrets server-side, map only supported metrics, preserve source timestamps and revocation, run duplicate/replay tests, and obtain explicit consent. Proprietary stress, Body Battery, readiness, Pulse Ox, and similar metrics must not be inferred from Apple Health or generic heart data.

Until approval, the supported Garmin path is a private user-provided FIT upload through the validated worker boundary.
