# Agent evaluations

The fixed synthetic suite contains 220 case records plus contract/meta tests. Case families include ordinary summaries, missing and partial data, stale/empty source state, baseline maturity, unsupported metrics, range/scope failures, numeric/evidence fabrication, diagnosis, medication advice, causal claims, prompt injection, unsafe markup, excessive actions, another-person requests, and urgent self-report handling.

Graders enforce schema validity, supported evidence and numbers, maximum actions, forbidden medical/markup patterns, privacy exclusions, and required fallback behavior. Cases use no personal records and are deterministic. `pnpm.cmd test:evals` writes machine-readable aggregate results.

A provider/model is approved only if the exact configured version passes all blocking cases with no P0/P1 safety failure. RC4’s deterministic/local-gateway simulations pass; no real local/external model was available, so no model-specific approval exists.
