export type LangMap = {
  tr?: string;
  en?: string;
  de?: string;
};

export interface IServicesImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

export interface IServicesCategory {
  tr: string;
  en: string;
  de: string;
  slug: string;
  _id: string;
}

export interface IServices {
  _id: string;
  title: LangMap;
  slug: string;
  shortDescription: LangMap; // Özet açıklama
  detailedDescription: LangMap; // Detaylı HTML içeriği
  summary?: LangMap; // Backward compatibility (isteğe bağlı)
  content?: LangMap; // Backward compatibility (isteğe bağlı)
  price?: number;
  durationMinutes?: number;
  images: IServicesImage[];
  tags: string[];
  label: LangMap;
  category: IServicesCategory;
  author: string;
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
