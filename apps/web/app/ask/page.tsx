import type { Metadata } from "next";
import { AppShell } from "../../components/app-shell";
import { AskExperience } from "../../components/ask-experience";
import { PrivateEmptyState } from "../../components/private-empty-state";
import { isDemoMode } from "../../lib/runtime-mode";

export const metadata: Metadata = { title: "Ask my data" };
export default function AskPage() {
  const demoMode = isDemoMode();
  return (
    <AppShell privateMode={!demoMode}>
      {demoMode ? <AskExperience /> : <PrivateEmptyState title="Ask my data" />}
    </AppShell>
  );
}
