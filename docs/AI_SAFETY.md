# AI safety

The AI safety package validates structure and content before any provider text is shown.

- Input is a trusted, bounded aggregate envelope; untrusted text is delimited and never treated as instruction.
- Output must match the narrative schema and contain at most three actions.
- Every evidence ID and numeric claim must be supported by input.
- Diagnosis, causal certainty, treatment/medication advice, panic/shame, unsafe links/markup, and unsupported proprietary metrics are rejected.
- Provider errors, non-2xx, timeout, abort, malformed JSON, schema failure, or content failure return the deterministic fallback.
- No model may call tools recursively or write records.

The fixed suite includes normal, missing/partial, adversarial injection, unsupported-value, diagnosis/medication, markup, and urgent-language cases. Passing synthetic tests is necessary but not sufficient for a specific model; re-run after any model/prompt/parser change.
