export type LangMap = {
  tr?: string;
  en?: string;
  de?: string;
};

export interface IAboutImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

export interface IAboutCategory {
  tr: string;
  en: string;
  de: string;
  slug: string;
  _id: string;
}

export interface IAbout {
  _id: string;
  title: LangMap;
  slug: string;
  shortDescription: LangMap;
  detailedDescription: LangMap; 
  summary?: LangMap; 
  content?: LangMap;
  images: IAboutImage[];
  tags: string[];
  label: LangMap;
  category: IAboutCategory;
  author: string;
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

