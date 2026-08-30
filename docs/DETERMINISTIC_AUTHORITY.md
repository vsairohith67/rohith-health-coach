# Deterministic authority

These invariants are release gates:

1. Source normalization, deduplication, local-day aggregation, completeness, baseline statistics, trend comparisons, evidence, and coach findings are deterministic code paths.
2. `null`, partial, conflict, and freshness states cannot be rewritten by a model.
3. A model receives only a parsed `ResultEnvelope`; it has no database, Storage, ingestion, export, deletion, or arbitrary-network tool.
4. Every narrative numeric claim and evidence ID must exist in the input envelope.
5. A model output cannot create or modify canonical rows. The response is presentation only.
6. Disabled, unreachable, timed-out, malformed, unsupported, or unsafe providers return a deterministic explanation.
7. Provider/model/prompt version and safety flags are recorded when AI-assisted text is deliberately persisted.

No future configuration may weaken these invariants without a new threat model, evaluation run, privacy review, and release gate.
