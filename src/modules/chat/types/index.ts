import type { SupportedLocale } from "@/types/common";

// Çok dilli alan FE tipi (BE TranslatedLabel ile eşleşir)
export type TranslatedField = Partial<Record<SupportedLocale, string>>;

// Mesaj (kullanıcı, bot, admin)
export interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  } | null;
  tenant: string;
  roomId: string;            // BE: roomId
  message: string;
  isFromBot?: boolean;
  isFromAdmin?: boolean;
  isRead?: boolean;
  language: TranslatedField; // BE: language
  createdAt: string;
  updatedAt?: string;
}

// Sohbet oturumu (session)
export interface ChatSession {
  _id: string;
  roomId: string;
  tenant: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  closedAt?: string;
}

// Arşivlenmiş oturum (admin görünümü)
export interface ArchivedSession {
  room: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
  lastMessage: string;
  closedAt: string;
}

// (Opsiyonel) Destek/Escalation kaydı — UI tarafında göstermek için
export interface EscalatedRoom {
  room: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  lang: string;        // örn. "tr"
  createdAt: string;   // ISO
}
