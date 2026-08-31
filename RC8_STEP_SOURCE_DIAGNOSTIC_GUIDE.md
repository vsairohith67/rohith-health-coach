# RC8 Step source-identity diagnostic guide

Prepared: 2026-08-31

Diagnostic name: **Inspect Apple Health Step Sources — Local Only**

Status: **READY FOR USER ACTION**

This is a local visual diagnostic. It must not contain `Get Contents of URL`, POST, Upload, Share, Mail, Messages, Save File, Clipboard, or automation actions. It does not modify Rohith Health Coach and does not upload Steps. Steps remain excluded from RC8 regardless of the result.

## Build the diagnostic

1. On the iPhone, create a new Shortcut named **Inspect Apple Health Step Sources — Local Only**.
2. Add `Current Date` as `End`.
3. Add `Adjust Date` and subtract 30 minutes as `Start`. If the first run returns no sample, manually widen once to 2 hours; do not query days of history.
4. Add `Find Health Samples` with type **Step Count**, Start Date at or after `Start`, Start Date before `End`, newest first, and limit 10.
5. Add `Repeat with Each` over the returned samples.
6. Inside the loop, use `Get Details of Health Samples`, the Repeat Item's Health Sample detail picker, or the current equivalent to request each field individually when offered:
   - Start Date
   - End Date
   - Source or Source Name
   - Source Bundle Identifier
   - Device
   - Device Name
   - Device Manufacturer
   - Device Model
   - Device Local Identifier
   - Sample UUID or stable record identifier
   - Unit
7. Add one `Text` action inside the loop with labelled lines for those fields. Include `UNAVAILABLE` literally when a detail is not offered; do not infer it from another field. The Step value is not needed for classification and should be omitted from the text.
8. After `End Repeat`, add `Quick Look` or `Show Result` for the Repeat Results.
9. Run manually while the phone is unlocked. Allow read access to Step Count only for this diagnostic.
10. Inspect the result on screen, then close it. Do not copy, save, screenshot, dictate, or send the output.

Apple's public Shortcuts guide documents `Find Health Samples`, Repeat, and Quick Look as local inspection building blocks, but it does not promise that every Health sample exposes an application bundle, generating device, or stable record identifier. This diagnostic therefore tests the actual iPhone/iOS record surface instead of assuming fields exist.

## Classification

Record only one classification later—never the sample details:

### `STEPS_SOURCE_IDENTITY_VERIFIED`

Use this only if the diagnostic exposes a stable per-sample field or combination that unambiguously separates known Garmin Connect/CIRQA samples from iPhone samples, Apple Watch samples if present, and other apps/devices. Verification requires observing records with known origins; a label that merely says Apple Health, Health, iPhone, or a generic phone is insufficient.

### `STEPS_SOURCE_IDENTITY_NOT_RELIABLE`

Use this if source/bundle/device details are unavailable, generic, inconsistent, merged, or cannot be tied to known originating records with confidence. Also use it if Shortcuts exposes only a daily total or Apple Fitness total rather than source-qualified samples.

## Safety decision

In either classification, the RC8 production Shortcut keeps Steps excluded. A verified result is evidence for a separately reviewed future source-arbitration pilot; it is not permission to upload or automate Steps. An unreliable result means the product must continue preferring no Step number over an ambiguous or double-counted number.

## Official Apple references

- https://support.apple.com/guide/shortcuts/-apd3c845e881/ios
- https://support.apple.com/guide/shortcuts/apdc11deb2c1/ios
- https://support.apple.com/guide/shortcuts/apd961a4fc65/ios
