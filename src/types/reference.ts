export interface IReference {
    _id: string;
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    language: "tr" | "en" | "de";
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
  }
  