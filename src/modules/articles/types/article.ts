// src/types/article.ts

export type LangMap = {
  tr?: string;
  en?: string;
  de?: string;
};

export interface IArticlesImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

export interface IArticles {
  _id: string;
  title: LangMap;
  slug: string;
  summary: LangMap;
  content: LangMap;
  images: IArticlesImage[];
  tags: string[];
  label: LangMap;
  category: string | { _id: string; name: LangMap };
  author: string;
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: string;
  comments: string[]; // or { ... }[] if you populate
  createdAt: string;
  updatedAt: string;
}
