import type { SupportedLocale } from "@/types/common";

// Çok dilli alan için merkezi tip
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

// Mesaj (kullanıcı, bot, admin)
export interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  } | null;
  tenant: string;
  roomId: string;              // (backend: roomId)
  message: string;
  isFromBot?: boolean;
  isFromAdmin?: boolean;
  isRead?: boolean;
  language: TranslatedField;   // backenddeki language ile birebir!
  createdAt: string;
  updatedAt: string;
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

// Arşivlenmiş oturum
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

// Destek/Escalation (isteğe bağlı)
export interface EscalatedRoom {
  room: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  lang: string;
  createdAt: string;
}
