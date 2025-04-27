
// Dosya: src/app/visitor/blogs/[slug]/page.tsx

import SocialShareButtons from "@/components/shared/SocialShareButtons";
import { format } from "date-fns";

async function getBlogBySlug(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/slug/${slug}`, {
    next: { revalidate: 60 },
  });
  const data = await res.json();
  return data.blog;
}

const BlogDetailPage = async ({ params }: { params: { slug: string } }) => {
  const blog = await getBlogBySlug(params.slug);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>{blog.title}</h1>
      <p>{format(new Date(blog.publishedAt), "PPP")}</p>
      <div>
        {blog.images?.map((img: string, i: number) => (
          <img key={i} src={img} alt={`img-${i}`} style={{ maxWidth: "100%", margin: "1rem 0" }} />
        ))}
      </div>
      <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      <SocialShareButtons
        url={`${process.env.NEXT_PUBLIC_SITE_URL}/visitor/blogs/${blog.slug}`}
        title={blog.title}
      />
    </div>
  );
};

export default BlogDetailPage;

