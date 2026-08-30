# Hosting decision

Selected architecture, when authorized and verified:

- Supabase for private Auth/Postgres/Storage/ingestion.
- Vercel for one private-use PWA deployment after a synthetic Preview.
- A private authenticated FastAPI container only if the official FIT decoder is approved and the host can meet privacy/logging requirements.
- Local stdio MCP for Codex; loopback HTTP plus an authorized secure tunnel for ChatGPT.

Netlify remains the documented web-host alternative and is not used simultaneously. Cloudflare is unnecessary without an owned domain/tunnel need. Hugging Face hosted inference is disabled. Current decision state is **prepared, not activated** because secure free-resource suitability and hosted gates are unverified.
