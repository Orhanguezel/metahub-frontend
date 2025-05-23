export type LangMap = {
  tr?: string;
  en?: string;
  de?: string;
};

export interface IReferenceImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

export interface IReferenceCategory {
  _id: string;
  name: LangMap;
  slug: string;
  isActive: boolean;
}

export interface IReference {
  _id: string;
  title: LangMap;
  slug: string;
  summary?: LangMap;
  content?: LangMap;
  images?: IReferenceImage[];
  tags?: string[];
  category?: IReferenceCategory | null;
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
