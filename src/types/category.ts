export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    language?: "tr" | "en" | "de";
    createdAt: string;
    updatedAt: string;
  }
  