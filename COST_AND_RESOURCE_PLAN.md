# Cost and resource plan

RC4 created no paid resource. Connected inventory showed: one Supabase organization with no project, a Vercel Hobby team with one unrelated project, a Netlify Free owner team with zero sites, a personal Notion workspace, no matching Asana project, and a non-Pro Hugging Face account. No FastAPI Cloud app/CLI integration existed.

Preferred minimal topology: one Supabase project, one Vercel project (preview then production), optional one private FIT worker only after need/host review, no simultaneous Netlify site, no external inference endpoint/job, and no public MCP/app. Use free/hobby tiers only if current limits and health-data/privacy requirements are acceptable; confirm current price/region/backups/egress before creation.

Set budget alerts and caps where supported. Avoid paid branches, domains, GPU endpoints, log drains, analytics, and always-on worker capacity without explicit approval. Costs were not confirmed because Supabase requires the user to select/confirm organization and price before project creation.
