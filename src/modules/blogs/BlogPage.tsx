'use client';

import BlogListSection from "@/modules/blogs/BlogListSection";

const sections = [
  { id: "blog-list", component: BlogListSection },
];

export default function BlogPage() {
  return (
    <>
      {sections.map(({ id, component: SectionComponent }) => (
        <SectionComponent key={id} />
      ))}
    </>
  );
}
