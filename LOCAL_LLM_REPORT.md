# Local LLM report

Status: **DISABLED; not benchmarked**.

Ollama 0.32.13 is installed locally, but probes to common local-model ports found no responding endpoint and the model inventory command did not complete. No model name, RAM/VRAM use, first-token latency, total latency, unload/reload, tool-selection score, JSON compliance score, or safety benchmark is claimed. No model was downloaded automatically.

Prepared candidates, subject to license/hardware review, are Qwen3 4B Instruct, Phi-4 Mini Instruct, and gated Gemma 3 4B. The gateway only accepts loopback local endpoints, passes allowlisted aggregate tool output, suppresses raw logs, validates schema/evidence/safety, and falls back to deterministic output on absence, timeout, malformed JSON, unsupported values, or safety failure.
