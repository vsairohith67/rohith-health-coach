# Vercel deployment

Vercel is the preferred web host. Deploy from the monorepo root with Node.js 22 and pnpm 10.17.1. `vercel.json` runs the frozen install and root build, then uses `apps/web/.next`.

Start with a preview. Demo Mode can run without cloud credentials. A private-data preview requires separate Preview environment values for Supabase URL/publishable key and server-only values; never copy production secrets into logs or reports. Verify the Demo banner, sign-in boundary, cache policy, responsive UI, no health values in telemetry, and no runtime errors.

Promote only a tested exact commit and only after the hosted Supabase, Auth, RLS, Storage, ingestion, privacy, rollback, and monitoring gates pass. No matching Vercel project existed at inventory time; the only existing project was unrelated and was not modified.
