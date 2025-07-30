import type { SupportedLocale } from "@/types/common";

export type TranslatedField = { [lang in SupportedLocale]: string };

export interface INotification {
  _id: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
  } | null;
  tenant: string;
  type: "info" | "success" | "warning" | "error";
  title: TranslatedField;
  message: TranslatedField;
  data?: any;
  isRead: boolean;
  isActive: boolean;
  createdAt: string;   // ISO string
  updatedAt: string;
}
