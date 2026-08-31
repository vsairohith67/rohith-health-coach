import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AppShell } from "../../../components/app-shell";
import {
  IngestionCredentialManager,
  type IngestionDeviceSummary,
} from "../../../components/ingestion-credential-manager";
import { createServerSupabaseClient } from "../../../lib/auth/server";
import { isDemoMode } from "../../../lib/runtime-mode";

export const metadata: Metadata = { title: "iPhone ingestion credential" };

const deviceSummarySchema = z
  .object({
    device_id: z.uuid(),
    device_name: z.string().min(1).max(80),
    token_hint: z.string().regex(/^\.\.\.[0-9a-f]{6}$/),
    credential_created_at: z.iso.datetime({ offset: true }),
    expires_at: z.iso.datetime({ offset: true }),
    last_used_at: z.iso.datetime({ offset: true }).nullable(),
    revoked_at: z.iso.datetime({ offset: true }).nullable(),
  })
  .strict();

function toSafeSummaries(data: unknown): IngestionDeviceSummary[] {
  const parsed = z.array(deviceSummarySchema).safeParse(data);
  if (!parsed.success) return [];
  return parsed.data.map((row) => ({
    deviceId: row.device_id,
    deviceName: row.device_name,
    tokenHint: row.token_hint,
    credentialCreatedAt: row.credential_created_at,
    expiresAt: row.expires_at,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
  }));
}

export default async function IngestionSettingsPage() {
  const demoMode = isDemoMode();
  if (demoMode) {
    return (
      <AppShell>
        <header className="section-header">
          <p>Private device access</p>
          <h1>iPhone ingestion</h1>
          <span>Credential issuance is unavailable in isolated Demo Mode.</span>
        </header>
        <section className="credential-panel">
          <h2>No Production credential can be created here</h2>
          <p>
            Sign in to the private Production application when the controlled
            pilot begins.
          </p>
        </section>
      </AppShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/sign-in");

  const { data, error } = await supabase.rpc("list_ingestion_devices");
  const devices = error ? [] : toSafeSummaries(data);

  return (
    <AppShell privateMode>
      <header className="section-header">
        <p>Private device access</p>
        <h1>iPhone ingestion</h1>
        <span>
          Issue, rotate, or revoke the narrowly scoped credential used by the
          Apple Shortcut.
        </span>
      </header>
      {error ? (
        <section className="credential-panel" role="alert">
          <h2>Credential service unavailable</h2>
          <p>
            The database migration must be applied before a credential can be
            issued.
          </p>
        </section>
      ) : (
        <IngestionCredentialManager devices={devices} />
      )}
    </AppShell>
  );
}
