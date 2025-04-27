export interface ChatUser {
  _id: string;
  name: string;
  email: string;
}

export interface ChatMessage {
  _id: string;
  sender: ChatUser | null;
  message: string;
  room: string;
  createdAt: string;
  lang: "tr" | "en" | "de";
  isFromBot?: boolean;
  isFromAdmin?: boolean;
  isRead?: boolean;
}

export interface EscalatedRoom {
  room: string;
  user: ChatUser;
  message: string;
  lang: string;
  createdAt: string;
}

export interface ArchivedSession {
  room: string;
  user: ChatUser;
  lastMessage: string;
  closedAt: string;
}

export interface ChatState {
  room: string;
  selectedRoom: string;
  chatMessages: ChatMessage[]; // <-- çoğul kullanımı düzeltildi
  loading: boolean;
  error: string | null;
  escalatedRooms: EscalatedRoom[];
  archived: {
    sessions: ArchivedSession[];
    loading: boolean;
    error: string | null;
  };
}

  