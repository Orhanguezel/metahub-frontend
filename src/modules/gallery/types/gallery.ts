// types/gallery.ts
export interface GalleryCategory {
  _id: string;
  slug: string;
  name: {
    tr: string;
    en: string;
    de: string;
  };
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItemData {
  image: string;
  thumbnail?: string;
  webp?: string;
  title: { tr: string; en: string; de: string };
  description?: { tr: string; en: string; de: string };
  order?: number;
}

export interface GalleryItem {
  _id: string;
  category: string | GalleryCategory; 
  type: "image" | "video";
  items: GalleryItemData[];
  isPublished?: boolean;
  isActive?: boolean;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

