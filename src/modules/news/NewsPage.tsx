'use client';

import NewsListSection from "@/modules/news/NewsListSection";

const sections = [
  { id: "news-list", component: NewsListSection },
];

export default function NewsPage() {
  return (
    <>
      {sections.map(({ id, component: SectionComponent }) => (
        <SectionComponent key={id} />
      ))}
    </>
  );
}

