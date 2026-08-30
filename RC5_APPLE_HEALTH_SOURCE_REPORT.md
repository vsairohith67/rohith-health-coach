# RC5 Apple Health source report

Verified against current public Apple documentation on 2026-08-30. No physical iPhone or real Health record was used.

## What Apple documents

Apple's current Shortcuts User Guide documents `Find Health Samples` as a Find action and documents adding filters, sorting, and limits. It does not publish an exhaustive field contract guaranteeing source revision, bundle identifier, sample UUID, or generating-device details as Magic Variable properties for every supported health type and iOS version.

Apple's native HealthKit documentation is stronger: an `HKObject` retrieved from HealthKit has a UUID and source revision, and may have an `HKDevice`; source revision identifies the app or device that created the object. Those native API capabilities do not prove equivalent exposure through the Shortcuts action.

Official references:

- <https://support.apple.com/guide/shortcuts/apd3c845e881/ios>
- <https://support.apple.com/guide/shortcuts/add-filter-parameters-apdbdab3433f/ios>
- <https://developer.apple.com/documentation/healthkit/hkobject/sourcerevision>
- <https://developer.apple.com/documentation/healthkit/hkdevice>
- <https://developer.apple.com/documentation/healthkit/hkobject/uuid>

## RC5 contract

The payload can preserve source name, source bundle, provider, source-generating device name/manufacturer/model/local identifier, source record ID, start/end, value, unit, category, aggregation shape, and coverage when available. All provenance fields are retained; the registered Shortcut phone remains a separate authenticated ingestion device.

Source classification is conservative. Generic Apple Health/Apple Fitness data is `unknown`, not Garmin. Garmin classification requires explicit Garmin or CIRQA evidence in the provided source/provider/device fields.

## Pilot decision

The initial real Apple Shortcut pilot must not export Steps until a manual run on the actual iPhone proves that reliable Garmin-versus-iPhone provenance is available for each Step sample. If that proof is unavailable, Steps remain excluded. If ambiguous Step records are imported later, daily Step analytics remains unavailable and diagnostics shows the conflict.

The system explicitly prefers no Step number over a wrong Step number. Real-data pilot status remains **NOT STARTED**.
