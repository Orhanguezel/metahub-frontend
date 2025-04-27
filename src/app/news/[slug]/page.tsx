import NewsDetailSection from "@/modules/news/NewsDetailSection";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <NewsDetailSection title={`News: ${params.slug}`} content="This is the detail page for the selected news." />
  );
}
