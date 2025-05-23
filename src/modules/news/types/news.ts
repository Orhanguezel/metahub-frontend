// src/types/news.ts
export type MultilingualField = {
  [key in "tr" | "en" | "de"]?: string;
};

export interface INews {
  _id: string;
  title: MultilingualField;
  summary: MultilingualField;
  content: MultilingualField;
  
  slug: string;
  tags: string[];
  images: {
    url: string;
    thumbnail: string;
    webp?: string;
    publicId?: string;
  }[];
  category?: {
    _id: string;
    name?: MultilingualField;
  };
  author?: string;
  comments?: string[];
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

