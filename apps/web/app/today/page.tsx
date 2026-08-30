import type { Metadata } from "next";
import { AppShell } from "../../components/app-shell";
import { PrivateEmptyState } from "../../components/private-empty-state";
import { TodayDashboard } from "../../components/today-dashboard";
import { isDemoMode } from "../../lib/runtime-mode";

export const metadata: Metadata = { title: "Today" };
export default function TodayPage() {
  const demoMode = isDemoMode();
  return (
    <AppShell privateMode={!demoMode}>
      {demoMode ? <TodayDashboard /> : <PrivateEmptyState title="Today" />}
    </AppShell>
  );
}
