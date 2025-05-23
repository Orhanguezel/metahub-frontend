export interface GalleryItemData {
    image: string;
    thumbnail?: string;
    webp?: string;
    title: {
      tr: string;
      en: string;
      de: string;
    };
    description?: {
      tr: string;
      en: string;
      de: string;
    };
    order?: number;
  }
  
  export interface GalleryItem {
    _id: string;
    category: string;
    type: string;
    items: GalleryItemData[];
  }
  