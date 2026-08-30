# Private FIT parser

This service validates Garmin FIT framing, length, signature and CRC locally, then delegates decoding to an owner-installed official Garmin FIT SDK adapter. The official SDK is not redistributed because its licence must be accepted by the owner.

Production requires `FIT_INTERNAL_TOKEN` and a trusted `FIT_OFFICIAL_DECODER_PATH`. The adapter executable is invoked without a shell and receives only `--input <temporary-file> --output-json <temporary-file>`. Pin `FIT_OFFICIAL_DECODER_SHA256` after installing the owner-approved adapter. Demo Mode and `/validate` work without the decoder; `/parse` fails closed with `official_fit_sdk_not_configured`.

Run locally:

```powershell
uv sync --dev
$env:FIT_INTERNAL_TOKEN = "replace-with-a-long-random-token"
uv run uvicorn app.main:app --host 127.0.0.1 --port 8080 --no-access-log
```

Uploaded bytes remain in a private process temporary directory only for a parse request and are deleted on completion. Logs contain a short content-hash prefix and size, never filenames, health samples, GPS, tokens, or decoder output.
