# Official Garmin FIT SDK setup

The official SDK is not redistributed. The owner must:

1. Obtain the current SDK from Garmin’s official developer site and review its licence.
2. Build or select a minimal decoder adapter outside the release archive.
3. Ensure it accepts only `--input <path> --output-json <path>`, uses no network, and emits the documented bounded JSON schema.
4. Calculate the adapter executable SHA-256 and set `FIT_OFFICIAL_DECODER_SHA256` through the worker’s secret/config manager.
5. Set the absolute private path in `FIT_OFFICIAL_DECODER_PATH` and the exact supported profile version.
6. Run clean, truncated, CRC-invalid, oversized, developer-field, and adversarial corpus tests in a disposable private environment.

Do not install the SDK in the web app, browser bundle, public repository, release ZIP, or public image. Installation/licence acceptance and full decoding remain owner actions.
