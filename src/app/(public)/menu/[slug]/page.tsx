// app/(public)/menu/[slug]/page.tsx
import Page from "@/modules/menu/public/pages/Page";

type RouteProps = {
  params: { slug: string };
  // Next 15+: searchParams bir Promise
  searchParams: Promise<{ branch?: string }>;
};

export default async function MenuRoutePage({ params, searchParams }: RouteProps) {
  // ✅ önce çöz (await), sonra client bileşenine geçir
  const sp = await searchParams;
  return <Page params={params} searchParams={sp} />;
}
