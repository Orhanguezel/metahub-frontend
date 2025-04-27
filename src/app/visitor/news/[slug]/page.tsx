"use client";

// src/app/visitor/news/[slug]/page.tsx
import { use } from "react";
import NewsDetailSection from "@/components/visitor/news/NewsDetailSection";

export default function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params); // ✅ use() ile Promise çözülüyor
  return <NewsDetailSection slug={slug} />;
}
