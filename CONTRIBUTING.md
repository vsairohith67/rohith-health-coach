# Contributing

This is a private project. Use synthetic fixtures only; never commit real health data, FIT files, tokens, private URLs, logs, screenshots, model weights, or environment files.

Keep deterministic authority, missingness, owner RLS, explicit grants, bounded queries, read-only MCP, medical safety, and default-off integrations intact. Add tests for every behavior/security change. Pin dependencies/CI actions/images and update locks. Run format, lint, typecheck, full tests/evals/build/E2E, Python, local database, dependency, and secret gates before review.

Do not enable production flags, deploy, publish a plugin/app, or weaken privacy/safety without an explicit release decision and updated reports.
