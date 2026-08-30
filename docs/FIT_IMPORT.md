# FIT import

FIT files upload to the private `fit-private` bucket below `<user-id>/…`. The web/server records size, SHA-256, safe filename, detected type, parse state, profile version, and CRC result; original bytes never enter the release or AI/MCP output.

The FastAPI worker requires an internal bearer token, enforces the `.fit` extension, byte cap, header length, `.FIT` signature, declared data length, header CRC where present, and final file CRC. It passes a temporary file to an owner-installed decoder with a fixed argument list and no shell. Temporary input/output is deleted after the request.

`/validate` works without the Garmin SDK. `/parse` returns `503 official_fit_sdk_not_configured` until `FIT_OFFICIAL_DECODER_PATH` and its SHA-256 are configured. Never claim full FIT decode from header validation alone.
