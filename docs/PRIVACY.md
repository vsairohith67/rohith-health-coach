# Privacy

The product follows data minimization, purpose limitation, local-first explanation, and user-controlled activation.

## Collected when enabled

Supported aggregate sleep, activity, heart, and optional 1–5 wellbeing values; source/provenance; account preferences; safe ingestion/audit metadata; and private FIT objects long enough to parse under the chosen retention mode.

## Excluded by default

Medication data, symptoms, diagnoses, contact data, unrelated Apple Health types, raw GPS in AI/MCP results, free-text notes in AI, public profiles, advertising identifiers, third-party analytics, and external model transfer.

## Processing roles

Supabase and the chosen host process data only after the owner configures a private deployment. Vercel is preferred for the web UI; the FIT worker is separate and private. A local model keeps narration on the owner’s device. Hugging Face/OpenAI adapters are disabled stubs until a separate privacy and consent review.

## User controls

Users can inspect freshness/source, disconnect or revoke providers, export supported records, request scoped deletion, disable every AI/MCP feature, and delete retained FIT objects according to policy. Logs and Notion status tracking must never contain health values.

This is a product privacy design, not a claim of HIPAA, GDPR, DPDP, medical-device, or other legal certification. A jurisdiction-specific legal review is required before use beyond the owner’s private pilot.
