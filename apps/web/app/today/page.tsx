import type { Metadata } from "next";
import { AppShell } from "../../components/app-shell";
import { TodayDashboard } from "../../components/today-dashboard";

export const metadata: Metadata = { title: "Today" };
export default function TodayPage() {
  return (
    <AppShell>
      <TodayDashboard />
    </AppShell>
  );
}
