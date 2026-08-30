# AI provider privacy

| Provider                | Data location            | RC4 state                                 |
| ----------------------- | ------------------------ | ----------------------------------------- |
| Deterministic           | Application code only    | Enabled authority/fallback                |
| Local OpenAI-compatible | Owner’s loopback machine | Implemented, disabled, no model installed |
| Hugging Face Inference  | External processor       | Disabled stub                             |
| OpenAI API              | External processor       | Disabled stub                             |

Even when enabled, a provider may receive only the current bounded aggregate result: metric labels/values/units, range, freshness, completeness, baseline status, findings/evidence IDs, and limitations. It may not receive identity/contact data, raw samples, notes, routes, FIT files, tokens, medication, or another person’s data.

External activation requires separate consent naming the provider/purpose/categories, retention/training and regional review, cost/usage cap, deletion/revocation, and model-specific safety evidence.
