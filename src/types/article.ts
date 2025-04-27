export interface IArticle {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    content: string;
    image: string;
    author?: string;
    tags?: string[];
    language: "tr" | "en" | "de";
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
  }
  