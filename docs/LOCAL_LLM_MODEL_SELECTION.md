# Local LLM model selection

Shortlist reviewed from official Hugging Face model cards on 30 August 2026:

| Model                         | Size/licence                      | RC4 decision                                                                  |
| ----------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| Qwen/Qwen3-4B-Instruct-2507   | 4B, Apache-2.0                    | Preferred first text-only benchmark candidate                                 |
| microsoft/Phi-4-mini-instruct | 3.8B/4B class, MIT                | Alternative; evaluate `trust_remote_code`/runtime carefully                   |
| google/gemma-3-4b-it          | 4B, Gemma terms, gated acceptance | Alternative only after owner accepts terms; multimodal ability is unnecessary |

Selection criteria: licence/access, text-only fit, RAM/VRAM, supported local runtime/quantization, JSON/tool adherence, latency, privacy, and fixed safety-eval performance. Popularity or general benchmarks do not establish safe health narration.

No benchmark was run because no reachable local endpoint/model existed. Therefore no model is approved and the configured model remains blank/default-off.
