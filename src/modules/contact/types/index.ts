// src/modules/contact/types/index.ts
export interface IContactMessage {
  _id: string;
  name: string;
  tenant: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
