// src/app/(public)/menu/item/[slug]/page.tsx
import ItemPage from "@/modules/menu/public/pages/ItemPage";

export default async function Route({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ branch?: string; channel?: "delivery"|"pickup"|"dinein" }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  return <ItemPage params={{ slug }} searchParams={sp} />;
}
