'use client';

interface BlogDetailProps {
  title?: string;
  content?: string;
}

export default function BlogDetailSection({ title = "Blog Title", content = "Blog content goes here." }: BlogDetailProps) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{content}</p>
    </section>
  );
}
