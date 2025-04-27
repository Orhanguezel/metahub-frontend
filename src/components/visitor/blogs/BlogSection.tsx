// components/visitor/blogs/BlogSection.tsx
import BlogCard from "./BlogCard";

const BlogSection = ({ blogs }: { blogs: any[] }) => (
  <section>
    <h2>Son Yazılar</h2>
    <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
      {blogs.map((b) => (
        <BlogCard key={b._id} blog={b} />
      ))}
    </div>
  </section>
);

export default BlogSection;
