export type BlogCategory = "ernaehrung" | "parasiten" | "vegan" | "allgemein";

export interface IBlog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  category: BlogCategory;
  author: string;
  isPublished: boolean;
  isActive: boolean;
  language?: "tr" | "en" | "de";
  comments: string[]; // ObjectId dizisi string olarak temsil edilir
  createdAt: string;
  updatedAt: string;
}
