# Local LLM future

The future local narrator must expose an OpenAI-compatible loopback endpoint, use a separately installed model, receive only validated aggregate envelopes, return schema-constrained JSON, and fall back deterministically on timeout/malformed/unsafe output.

Model weights are never placed in source/release archives. A model must pass the fixed evaluation/red-team suite on the owner’s actual hardware before `ENABLE_LOCAL_LLM=true`. Installation is not required for deterministic use.
