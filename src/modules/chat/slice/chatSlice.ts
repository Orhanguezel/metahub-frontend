import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { RootState } from "@/store";

// ✉️ Tipler
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
  lang: "tr" | "en" | "de";
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

// ✅ Yeni: Manuel mesaj durumu
interface ManualMessageState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

interface ChatState {
  room: string;
  selectedRoom: string;
  chatMessages: ChatMessage[];
  loading: boolean;
  error: string | null;
  escalatedRooms: EscalatedRoom[];
  archived: {
    sessions: ArchivedSession[];
    loading: boolean;
    error: string | null;
  };
  sessions: {
    all: ChatSession[];
    active: ChatSession[];
    loading: boolean;
    error: string | null;
  };
  manualMessage: ManualMessageState;
}

// ✅ Initial state
const initialState: ChatState = {
  room: "",
  selectedRoom: "",
  chatMessages: [],
  loading: false,
  error: null,
  escalatedRooms: [],
  archived: {
    sessions: [],
    loading: false,
    error: null,
  },
  sessions: {
    all: [],
    active: [],
    loading: false,
    error: null,
  },
  manualMessage: {
    loading: false,
    success: false,
    error: null,
  },
};

interface ManualMessagePayload {
  roomId: string;
  message: string;
  lang: "tr" | "en" | "de";
  close?: boolean;
}

// ✅ Async: Belirli odaya ait mesajları getir
export const fetchMessagesByRoom = createAsyncThunk<
  ChatMessage[],
  string,
  { rejectValue: any }
>("chat/fetchMessagesByRoom", async (roomId, { rejectWithValue }) => {
  return await apiCall("get", `/chat/${roomId}`, null, rejectWithValue);
});

// ✅ Async: Arşivlenmiş oturumları getir
export const fetchArchivedSessions = createAsyncThunk<
  ArchivedSession[],
  void,
  { rejectValue: any }
>("chat/fetchArchivedSessions", async (_, { rejectWithValue }) => {
  return await apiCall("get", "/chat/archived", null, rejectWithValue);
});

// ✅ Async: Tüm oturumları getir
export const fetchAllChatSessions = createAsyncThunk<
  ChatSession[],
  void,
  { rejectValue: any }
>("chat/fetchAllChatSessions", async (_, { rejectWithValue }) => {
  return await apiCall("get", "/chat/sessions", null, rejectWithValue);
});

// ✅ Async: Sadece aktif oturumları getir
export const fetchActiveChatSessions = createAsyncThunk<
  ChatSession[],
  void,
  { rejectValue: any }
>("chat/fetchActiveChatSessions", async (_, { rejectWithValue }) => {
  return await apiCall("get", "/chat/sessions/active", null, rejectWithValue);
});

// ✅ Async: Mesajları okundu olarak işaretle
export const markMessagesAsRead = createAsyncThunk<
  void,
  string,
  { rejectValue: any }
>("chat/markMessagesAsRead", async (roomId, { rejectWithValue }) => {
  return await apiCall("patch", `/chat/read/${roomId}`, null, rejectWithValue);
});

// ✅ Async: Admin'in manuel mesaj göndermesi
export const sendManualMessage = createAsyncThunk<
  void,
  ManualMessagePayload,
  { rejectValue: any }
>("chat/sendManualMessage", async (payload, { rejectWithValue }) => {
  return await apiCall("post", "/chat/manual", payload, rejectWithValue);
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setRoom(state, action: PayloadAction<string>) {
      state.room = action.payload;
      state.selectedRoom = action.payload;
      state.chatMessages = [];
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      const exists = state.chatMessages.some((msg) => msg._id === action.payload._id);
      if (!exists) {
        state.chatMessages.push(action.payload);
      }
    },
    addEscalatedRoom(state, action: PayloadAction<EscalatedRoom>) {
      const exists = state.escalatedRooms.some(r => r.room === action.payload.room);
      if (!exists) {
        state.escalatedRooms.unshift(action.payload);
      }
    },
    clearMessages(state) {
      state.chatMessages = [];
    },
    clearManualMessageState(state) {
      state.manualMessage = {
        loading: false,
        success: false,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesByRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessagesByRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.chatMessages = action.payload;
      })
      .addCase(fetchMessagesByRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Mesajlar yüklenemedi.";
      })

      .addCase(fetchArchivedSessions.pending, (state) => {
        state.archived.loading = true;
        state.archived.error = null;
      })
      .addCase(fetchArchivedSessions.fulfilled, (state, action) => {
        state.archived.loading = false;
        state.archived.sessions = action.payload;
      })
      .addCase(fetchArchivedSessions.rejected, (state, action) => {
        state.archived.loading = false;
        state.archived.error = action.payload?.message || "Arşiv yüklenemedi.";
      })

      .addCase(fetchAllChatSessions.fulfilled, (state, action) => {
        state.sessions.all = action.payload;
      })
      .addCase(fetchActiveChatSessions.fulfilled, (state, action) => {
        state.sessions.active = action.payload;
      })

      .addCase(sendManualMessage.pending, (state) => {
        state.manualMessage.loading = true;
        state.manualMessage.error = null;
        state.manualMessage.success = false;
      })
      .addCase(sendManualMessage.fulfilled, (state) => {
        state.manualMessage.loading = false;
        state.manualMessage.success = true;
      })
      .addCase(sendManualMessage.rejected, (state, action) => {
        state.manualMessage.loading = false;
        state.manualMessage.error = action.payload?.message || "Manuel mesaj gönderilemedi.";
      });
  },
});

// ✅ Actions
export const {
  setRoom,
  addMessage,
  addEscalatedRoom,
  clearMessages,
  clearManualMessageState,
} = chatSlice.actions;

// ✅ Selectors
export const selectChatRoom = (state: RootState) => state.chat.room;
export const selectSelectedRoom = (state: RootState) => state.chat.selectedRoom;
export const selectChatMessages = (state: RootState) => state.chat.chatMessages;
export const selectChatLoading = (state: RootState) => state.chat.loading;
export const selectChatError = (state: RootState) => state.chat.error;

export const selectEscalatedRooms = (state: RootState) => state.chat.escalatedRooms;
export const selectArchivedSessions = (state: RootState) => state.chat.archived.sessions;
export const selectArchivedLoading = (state: RootState) => state.chat.archived.loading;
export const selectArchivedError = (state: RootState) => state.chat.archived.error;

export const selectAllChatSessions = (state: RootState) => state.chat.sessions.all;
export const selectActiveChatSessions = (state: RootState) => state.chat.sessions.active;

export const selectManualMessageState = (state: RootState) => state.chat.manualMessage;

export default chatSlice.reducer;
