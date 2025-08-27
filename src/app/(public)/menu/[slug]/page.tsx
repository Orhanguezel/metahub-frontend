import Page from "@/modules/menu/public/pages/Page";

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

  return <Page params={{ slug }} searchParams={sp} />;
}
