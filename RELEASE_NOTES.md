# Release notes — 1.0.0-rc8

RC8 is an unattended local preparation release, not a hosted activation. The direct public-Git history scan passed, and existing GitHub, Supabase, and Vercel state was read back without mutation. RC7 remains the hosted Production source.

The prepared source adds a database-generated, one-time-display iPhone ingestion credential flow. It is owner-scoped, limited to `health:ingest`, HMAC-peppered at rest, valid for seven days, serialized against concurrent rotation, and never exposes the digest to the browser. The matching Production migration and UI are deliberately not deployed while unattended.

The iPhone Shortcut guide now matches the deployed snake_case request contract and permits only Sleep Analysis, Active Energy, Resting Energy, Walking + Running Distance, and Workouts over the previous 48 hours. Steps remain excluded. A separate local diagnostic is ready to determine whether the physical phone exposes reliable source identity without uploading a Step value.

The critical Garmin 4,861 plus iPhone 8,148 synthetic overlap still selects 4,861, preserves the alternative, and never produces 13,009. No real data, device token, iPhone operation, Apple Health permission, Garmin authentication, phone automation, AI, MCP, ChatGPT, Codex, Garmin cloud API, paid service, deployment, or GA promotion occurred.
