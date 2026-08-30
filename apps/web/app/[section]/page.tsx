import { notFound } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import { PrivateEmptyState } from "../../components/private-empty-state";
import {
  ProductSection,
  productSectionNames,
} from "../../components/section-page";
import { isDemoMode } from "../../lib/runtime-mode";

export function generateStaticParams() {
  return productSectionNames.map((section) => ({ section }));
}
export default async function SectionPage({
  params,
}: Readonly<{ params: Promise<{ section: string }> }>) {
  const { section } = await params;
  if (!productSectionNames.includes(section)) notFound();
  const demoMode = isDemoMode();
  const title = section
    .split("-")
    .map((part, index) =>
      index === 0 ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : part,
    )
    .join(" ");
  return (
    <AppShell privateMode={!demoMode}>
      {demoMode ? (
        <ProductSection section={section} />
      ) : (
        <PrivateEmptyState title={title} />
      )}
    </AppShell>
  );
}
