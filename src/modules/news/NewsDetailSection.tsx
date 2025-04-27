'use client';

interface NewsDetailProps {
  title?: string;
  content?: string;
}

export default function NewsDetailSection({ title = "News Title", content = "News content goes here." }: NewsDetailProps) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{content}</p>
    </section>
  );
}
