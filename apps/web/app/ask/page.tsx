import type { Metadata } from "next";
import { AppShell } from "../../components/app-shell";
import { AskExperience } from "../../components/ask-experience";

export const metadata: Metadata = { title: "Ask my data" };
export default function AskPage() {
  return (
    <AppShell>
      <AskExperience />
    </AppShell>
  );
}
