# Local LLM setup

Ollama is installed on the development PC but its endpoint did not start successfully during RC4 and no model inventory was available. No model was downloaded.

For a future test:

1. Choose one reviewed model/quantization that fits the owner’s hardware and licence.
2. Install weights outside the repository and release archives.
3. Start an OpenAI-compatible service on `127.0.0.1` only.
4. Set `LOCAL_LLM_BASE_URL`, `LOCAL_LLM_MODEL`, optional local key, timeout, and output cap through a private env file.
5. Run the full fixed agent evaluation/red-team suite against that exact model build.
6. Enable `ENABLE_LOCAL_LLM=true` and `ENABLE_AI_NARRATIVE=true` only if all safety gates pass; otherwise use deterministic fallback.

Never expose the local endpoint to LAN/public networks or send raw health/notes/GPS/medication.
