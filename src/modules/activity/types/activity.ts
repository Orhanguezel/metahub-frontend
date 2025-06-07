export type LangMap = {
  tr?: string;
  en?: string;
  de?: string;
};

export interface IActivityImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

export interface IActivityCategory {
  tr: string;
  en: string;
  de: string;
  slug: string;
  _id: string;
}

export interface IActivity {
  _id: string;
  title: LangMap;
  slug: string;
  shortDescription: LangMap;
  detailedDescription: LangMap; 
  summary?: LangMap; 
  content?: LangMap;
  images: IActivityImage[];
  tags: string[];
  label: LangMap;
  category: IActivityCategory;
  author: string;
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
