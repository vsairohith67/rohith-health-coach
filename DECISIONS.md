# Architecture decisions

## D-001 — Deterministic authority

Source records, normalization, aggregation, baselines, and coaching are deterministic. AI can only narrate validated tool results and cannot overwrite canonical data.

## D-002 — Demo-first execution

The application works without cloud credentials using a seeded 90-day synthetic data generator. Every demo view carries an explicit synthetic-data label.

## D-003 — Private data boundary

Supabase RLS and ownership checks protect user rows. Browser code never receives server secrets, ingestion hashes, raw FIT objects, notes for AI, GPS, or medication data.

## D-004 — Current framework versions

The release uses Next.js 16, React 19, TypeScript strict mode, Zod 4, Supabase's current JS/SSR clients, the official MCP TypeScript SDK, and Python 3.12-compatible FastAPI.

## D-005 — FIT SDK redistribution

No restricted Garmin SDK binary is bundled. The worker validates FIT headers/CRC boundaries and exposes an adapter that becomes fully decoding-capable only after the owner installs the official SDK under its licence.

## D-006 — External services

Vercel is the preferred web target; Netlify remains a documented alternative and is never deployed simultaneously. A FIT worker is local-only unless a private authenticated host is verified. No resource creation can bypass account-ownership, security, or cost gates.

## D-007 — Remote MCP authorization

The repository implements testable OAuth 2.1/PKCE security primitives and standards metadata contracts. It does not claim that Supabase Auth alone is a complete MCP authorization server. Secure MCP Tunnel is the preferred private ChatGPT connection when account permissions are available.
