// src/modules/chat/types/index.ts
import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için merkezi tanım
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

export interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  } | null;
  message: string;
  room: string;
  isFromBot?: boolean;
  isFromAdmin?: boolean;
  isRead?: boolean;
  lang: TranslatedField;
  createdAt: string;
}

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

export interface ChatSession {
  _id: string;
  roomId: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  closedAt?: string;
}

export interface ArchivedSession {
  room: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  lastMessage: string;
  closedAt: string;
}

  