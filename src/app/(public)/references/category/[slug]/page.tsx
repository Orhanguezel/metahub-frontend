// Server Component – /references/category/[slug]
import Page from "@/modules/references/public/pages/Page";

type RouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string; ps?: string }>;
};

export default async function ReferencesByCategoryPage(props: RouteProps) {
  const [{ slug }, sp] = await Promise.all([props.params, props.searchParams]);
  return <Page categorySlug={slug} initialSearch={sp} />;
}
