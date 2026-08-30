import { notFound } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import {
  ProductSection,
  productSectionNames,
} from "../../components/section-page";

export function generateStaticParams() {
  return productSectionNames.map((section) => ({ section }));
}
export default async function SectionPage({
  params,
}: Readonly<{ params: Promise<{ section: string }> }>) {
  const { section } = await params;
  if (!productSectionNames.includes(section)) notFound();
  return (
    <AppShell>
      <ProductSection section={section} />
    </AppShell>
  );
}
