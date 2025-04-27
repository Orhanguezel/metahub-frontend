export interface ILibraryItem {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    fileUrl: string;
    category?: string;
    language: "tr" | "en" | "de";
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
  }
  