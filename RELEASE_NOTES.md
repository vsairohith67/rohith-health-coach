# Release notes — 1.0.0-rc8.1

RC8.1 is the reviewed deployment candidate for the private iPhone ingestion-credential lifecycle. Hosted activation and pilot outcomes are recorded separately so this source note never contains a token, identity, payload, health measurement, or personal date.

The source adds a database-generated, one-time-display iPhone ingestion credential flow. It is owner-scoped, limited to `health:ingest`, HMAC-peppered at rest, valid for seven days, serialized against concurrent creation and rotation, and never exposes the digest to the browser. A deliberate clear action reloads the private no-store page and replaces the credential response in browser history.

The iPhone Shortcut guide now matches the deployed snake_case request contract and permits only Sleep Analysis, Active Energy, Resting Energy, Walking + Running Distance, and Workouts over the previous 48 hours. Steps remain excluded. A separate local diagnostic is ready to determine whether the physical phone exposes reliable source identity without uploading a Step value.

The critical Garmin 4,861 plus iPhone 8,148 synthetic overlap still selects 4,861, preserves the alternative, and never produces 13,009. This source release contains no real data, real device token, iPhone operation, Apple Health payload, Garmin authentication, phone automation, AI/MCP activation, paid service, or GA promotion.
