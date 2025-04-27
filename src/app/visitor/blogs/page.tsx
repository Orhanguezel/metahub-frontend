
// Dosya: src/app/visitor/blogs/page.tsx

import BlogCard from "@/components/visitor/blogs/BlogCard";

async function getBlogs() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
    next: { revalidate: 60 }, // ISR
  });
  const data = await res.json();
  return data.blogs || [];
}

const BlogListPage = async () => {
  const blogs = await getBlogs();

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📚 Bloglar</h2>
      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {blogs.map((blog: any) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>
    </div>
  );
};

export default BlogListPage;
