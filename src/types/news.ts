// src/types/news.ts
export interface INews {
    _id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    image: string;
    tags: string[];
    category?: string;
    author?: string;
    language: "tr" | "en" | "de";
    isPublished: boolean;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  