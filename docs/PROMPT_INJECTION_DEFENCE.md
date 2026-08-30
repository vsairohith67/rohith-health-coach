# Prompt injection defence

Threat sources include wellbeing note text, source metadata, external pages, model output, MCP descriptions/results, and pasted user instructions that try to override policy.

RC4 excludes notes/routes/raw metadata from AI and MCP envelopes. The system prompt names the aggregate JSON as data, not instruction. There is no web retrieval or dynamic tool execution inside narration. Tool names/schemas are static; output is parsed as JSON and checked against the source’s exact numeric/evidence allowlist. HTML and dangerous URL schemes are neutralized/rejected. A failure returns deterministic text.

Never add hidden prompts to database fields, concatenate raw note text into system messages, allow model-generated SQL/URLs/tool names, or accept “ignore previous instructions” from a result as control flow.
