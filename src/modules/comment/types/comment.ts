// src/types/comment.ts

export interface IComment {
  _id: string;
  name: string;
  email: string;
  label: { tr: string; en: string; de: string };
  contentType: "news" | "blog" | "product" | "articles" | "services" | "radonarprod";
  contentId: string | { _id: string; title?: any; slug?: string };
  userId?: string | { _id: string; name: string; email: string };
  isPublished: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  reply?: {
    text: {
      tr: string;
      en: string;
      de: string;
    };
    createdAt?: string;
  };
  rating?: number;
}


  