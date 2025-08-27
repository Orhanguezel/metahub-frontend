import Page from "@/modules/references/public/pages/Page";

// Next 15+: searchParams Promise
type RouteProps = {
  params: { slug?: string[] };
  searchParams: Promise<{ p?: string; ps?: string }>;
};

export default async function ReferencesRoutePage({ params, searchParams }: RouteProps) {
  const sp = await searchParams;

  // /references => undefined, /references/<slug> => params.slug[0]
  const categorySlug = Array.isArray(params.slug) ? params.slug[0] : undefined;

  return (
    <Page
      categorySlug={categorySlug}
      initialSearch={sp}
    />
  );
}
