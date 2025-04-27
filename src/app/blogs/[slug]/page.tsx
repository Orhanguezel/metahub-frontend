import BlogDetailSection from "@/modules/blogs/BlogDetailSection";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <BlogDetailSection title={`Blog: ${params.slug}`} content="This is the detail page for the selected blog." />
  );
}
