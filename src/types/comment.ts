export interface IComment {
    _id: string;
    name: string;
    email: string;
    comment: string;
    contentType: "blog" | "product" | "service";
    contentId: string;
    isPublished: boolean;
    isActive: boolean;
    language?: "tr" | "en" | "de";
    createdAt?: string;
    updatedAt?: string;
  }
  