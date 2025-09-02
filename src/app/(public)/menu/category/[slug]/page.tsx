// src/app/(public)/menu/category/[slug]/page.tsx
import CategoryPage from "@/modules/menu/public/pages/CategoryPage";

/**
 * Next 15: params & searchParams -> Promise
 * Bu yüzden destructure edilen props'u Promise olarak tipleyip await ediyoruz.
 */
export default async function MenuRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ branch?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  return <CategoryPage params={{ slug }} searchParams={sp} />;
}
