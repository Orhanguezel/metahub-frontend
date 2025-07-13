import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { RootState } from "@/store";
import {
  ChatMessage,
  ChatSession,
  ArchivedSession,
  EscalatedRoom,
  TranslatedField
} from "@/modules/chat/types";

interface ManualMessageState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

interface ChatState {
  // PUBLIC state
  room: string;
  selectedRoom: string;
  chatMessages: ChatMessage[];

  // ADMIN state
  chatMessagesAdmin: ChatMessage[];
  sessionsAdmin: ChatSession[];
  activeSessionsAdmin: ChatSession[];
  archivedSessionsAdmin: ArchivedSession[];

  // Common state
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

const initialState: ChatState = {
  room: "",
  selectedRoom: "",
  chatMessages: [],
  chatMessagesAdmin: [],
  sessionsAdmin: [],
  activeSessionsAdmin: [],
  archivedSessionsAdmin: [],
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
  lang: TranslatedField;
  close?: boolean;
}

// --- Thunks ---

// PUBLIC
export const fetchMessagesByRoom = createAsyncThunk<
  ChatMessage[],
  string,
  { rejectValue: any }
>("chat/fetchMessagesByRoom", async (roomId, { rejectWithValue }) => {
  return await apiCall("get", `/chat/${roomId}`, null, rejectWithValue);
});
export const fetchArchivedSessions = createAsyncThunk<
  ArchivedSession[],
  void,
  { rejectValue: any }
>("chat/fetchArchivedSessions", async (_, { rejectWithValue }) => {
  return await apiCall("get", "/chat/archived", null, rejectWithValue);
});
export const fetchAllChatSessions = createAsyncThunk<
  ChatSession[],
  void,
  { rejectValue: any }
>("chat/fetchAllChatSessions", async (_, { rejectWithValue }) => {
  return await apiCall("get", "/chat/sessions", null, rejectWithValue);
});
export const fetchActiveChatSessions = createAsyncThunk<
  ChatSession[],
  void,
  { rejectValue: any }
>("chat/fetchActiveChatSessions", async (_, { rejectWithValue }) => {
  return await apiCall("get", "/chat/sessions/active", null, rejectWithValue);
});
export const markMessagesAsRead = createAsyncThunk<
  void,
  string,
  { rejectValue: any }
>("chat/markMessagesAsRead", async (roomId, { rejectWithValue }) => {
  return await apiCall("patch", `/chat/read/${roomId}`, null, rejectWithValue);
});
export const sendManualMessage = createAsyncThunk<
  void,
  ManualMessagePayload,
  { rejectValue: any }
>("chat/sendManualMessage", async (payload, { rejectWithValue }) => {
  return await apiCall("post", "/chat/manual", payload, rejectWithValue);
});

// ADMIN
export const fetchMessagesByRoomAdmin = createAsyncThunk<
  ChatMessage[],
  string,
  { rejectValue: any }
>("chat/fetchMessagesByRoomAdmin", async (roomId, { rejectWithValue }) => {
  return await apiCall("get", `/chat/admin/${roomId}`, null, rejectWithValue);
});
export const fetchAllChatSessionsAdmin = createAsyncThunk<
  ChatSession[],
  void,
  { rejectValue: any }
>("chat/fetchAllChatSessionsAdmin", async (_, { rejectWithValue }) => {
  return await apiCall("get", "/chat/admin/sessions", null, rejectWithValue);
});
export const fetchActiveChatSessionsAdmin = createAsyncThunk<
  ChatSession[],
  void,
  { rejectValue: any }
>("chat/fetchActiveChatSessionsAdmin", async (_, { rejectWithValue }) => {
  return await apiCall("get", "/chat/admin/sessions/active", null, rejectWithValue);
});
export const fetchArchivedSessionsAdmin = createAsyncThunk<
  ArchivedSession[],
  void,
  { rejectValue: any }
>("chat/fetchArchivedSessionsAdmin", async (_, { rejectWithValue }) => {
  return await apiCall("get", "/chat/admin/archived", null, rejectWithValue);
});

// --- SLICE ---
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
      const exists = state.chatMessages.some(
        (msg) => msg._id === action.payload._id
      );
      if (!exists) state.chatMessages.push(action.payload);
    },
    addMessageAdmin(state, action: PayloadAction<ChatMessage>) {
      const exists = state.chatMessagesAdmin.some(
        (msg) => msg._id === action.payload._id
      );
      if (!exists) state.chatMessagesAdmin.push(action.payload);
    },
    addEscalatedRoom(state, action: PayloadAction<EscalatedRoom>) {
      const exists = state.escalatedRooms.some(
        (r) => r.room === action.payload.room
      );
      if (!exists) state.escalatedRooms.unshift(action.payload);
    },
    clearChatMessages(state) {
      state.chatMessages = [];
    },
    clearChatMessagesAdmin(state) {
      state.chatMessagesAdmin = [];
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
    // PUBLIC
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
        state.manualMessage.error =
          action.payload?.message || "Manuel mesaj gönderilemedi.";
      });

    // ADMIN
    builder
      .addCase(fetchMessagesByRoomAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessagesByRoomAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.chatMessagesAdmin = action.payload;
      })
      .addCase(fetchMessagesByRoomAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Admin mesajlar yüklenemedi.";
      })
      .addCase(fetchAllChatSessionsAdmin.fulfilled, (state, action) => {
        state.sessionsAdmin = action.payload;
      })
      .addCase(fetchActiveChatSessionsAdmin.fulfilled, (state, action) => {
        state.activeSessionsAdmin = action.payload;
      })
      .addCase(fetchArchivedSessionsAdmin.fulfilled, (state, action) => {
        state.archivedSessionsAdmin = action.payload;
      });
  },
});

// --- Actions ---
export const {
  setRoom,
  addMessage,
  addMessageAdmin,
  addEscalatedRoom,
  clearChatMessages,
  clearChatMessagesAdmin,
  clearManualMessageState,
} = chatSlice.actions;

// --- Selectors ---
export const selectChatRoom = (state: RootState) => state.chat.room;
export const selectSelectedRoom = (state: RootState) => state.chat.selectedRoom;
export const selectChatMessages = (state: RootState) => state.chat.chatMessages;
export const selectChatMessagesAdmin = (state: RootState) => state.chat.chatMessagesAdmin;
export const selectChatLoading = (state: RootState) => state.chat.loading;
export const selectChatError = (state: RootState) => state.chat.error;

export const selectEscalatedRooms = (state: RootState) => state.chat.escalatedRooms;
export const selectArchivedSessions = (state: RootState) => state.chat.archived.sessions;
export const selectArchivedSessionsAdmin = (state: RootState) => state.chat.archivedSessionsAdmin;
export const selectArchivedLoading = (state: RootState) => state.chat.archived.loading;
export const selectArchivedError = (state: RootState) => state.chat.archived.error;
export const selectAllChatSessions = (state: RootState) => state.chat.sessions.all;
export const selectAllChatSessionsAdmin = (state: RootState) => state.chat.sessionsAdmin;
export const selectActiveChatSessions = (state: RootState) => state.chat.sessions.active;
export const selectActiveChatSessionsAdmin = (state: RootState) => state.chat.activeSessionsAdmin;
export const selectManualMessageState = (state: RootState) => state.chat.manualMessage;

export default chatSlice.reducer;
