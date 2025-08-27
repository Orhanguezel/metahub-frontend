import Page from "@/modules/references/public/pages/Page";

export default async function ReferencesRoot({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; ps?: string }>;
}) {
  const sp = await searchParams;
  return <Page initialSearch={sp} />;
}
