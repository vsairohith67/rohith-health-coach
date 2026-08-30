# Deployment preflight

Date: 2026-08-30
Candidate: `1.0.0-rc4` cumulative source tree

## Input integrity

- Selected input: the working source at `rohith-health-coach`; no separate coherent RC2/RC3 ZIP or prior project Git history was present.
- Consequence: earlier RC archives are reproducibility snapshots reconstructed from the cumulative RC4 source and are labelled as such. They are not claimed to be preserved historical builds.
- Repository boundary: this child directory is the complete application; the parent workspace was not treated as application source.
- Secret scan: passed over 205 source text files before publication/package creation.
- Personal-data policy: synthetic fixtures only; `.env*` except `.env.example`, FIT/GGUF/log/key material, caches, and deployment state containing secrets are excluded.

## Reverification

Node 22, pnpm 10.17.1, Python 3.12/uv, Docker, Playwright, and Supabase CLI 2.116.0 were used. Format, lint, TypeScript, 254 Vitest tests, 220 evaluation cases, 10 Playwright cases, 40 pgTAP assertions, 5 FIT tests, schema lint, build, dependency audit, secret scan, and the FIT container build passed locally.

## Connected-resource inventory

- GitHub: personal account `vsairohith67`; no matching repository found at inspection time.
- Supabase: organization `Supabase test Organisation`; no projects. Project creation was not attempted because the connector requires explicit organization/cost confirmation at creation time.
- Vercel: personal Hobby team; only unrelated project `body-composition-journey`; it was not modified.
- Netlify: personal Free owner team; zero sites; retained as an alternative only.
- FastAPI Cloud: no authenticated deployment target verified; CLI deploy command is unavailable without adding `fastapi[standard]`.
- Hugging Face: authenticated personal non-Pro, read-scoped account; no job, endpoint, Space, upload, or model download created.
- Notion: personal workspace with a relevant Life OS project-hub parent; eligible only for one sanitized terminal-status child page.
- Asana: no matching project found; no resource created.

## Gate verdict

Local source gates pass. Hosted Preview, hosted database/Auth/RLS/Storage, private production, real-device, real-data, Codex, ChatGPT, tunnel, and local-model benchmark gates remain unexecuted or blocked. No billing plan, trial, deployment, real health connection, or externally enabled AI was created.
