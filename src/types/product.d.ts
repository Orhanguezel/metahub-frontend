// src/types/product.ts

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive: boolean;
  language?: "tr" | "en" | "de";
}

export interface IProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string | ICategory;
  tags: string[];
  stock: number;
  stockThreshold: number;
  slug: string;
  language: "tr" | "en" | "de";
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
