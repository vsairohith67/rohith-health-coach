# Release notes — 1.0.0-rc5

RC5 proves the core data boundary on hosted synthetic infrastructure. The free Mumbai Supabase project has five reproducible migrations, 179/179 hosted RLS checks, 21/21 private Storage checks, and 26/26 hosted ingestion checks. Temporary synthetic users, records, and objects were deleted after verification.

Source arbitration now prefers valid Garmin coverage, uses iPhone only as a proven fallback, refuses ambiguous totals, and deduplicates the same Garmin workout received through Apple Health and FIT. The `4,861` Garmin plus `8,148` iPhone overlap case returns `4,861`, never `13,009`. Apple Shortcut provenance limitations are explicit, so Steps remain excluded from a real pilot until source identity is proven on-device.

The synthetic Vercel Preview passed 28 route/viewport checks, three accessibility scans, PWA, dark-mode, reduced-motion, and conflict-state QA. Production and the full hosted E2E flow remain blocked because Supabase public email signup is still enabled. No real data, phone automation, AI, MCP, ChatGPT, Codex, Garmin cloud API, or GA promotion is enabled.
