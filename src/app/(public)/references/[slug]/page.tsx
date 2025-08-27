import Page from "@/modules/references/public/pages/Page";

export default async function ReferencesRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string; ps?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  return <Page categorySlug={slug} initialSearch={sp} />;
}
