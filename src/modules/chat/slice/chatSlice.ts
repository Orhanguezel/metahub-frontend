import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ChatMessage, ChatSession, ArchivedSession,EscalatedRoom } from "@/modules/chat/types";
// chatSlice.ts dosyanın SONUNDA export et:
import type { RootState } from "@/store";

// --- State ---
interface ManualMessageState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

interface ChatState {
  roomId: string; // aktif oda
  chatMessages: ChatMessage[];
  sessions: ChatSession[];
  activeSessions: ChatSession[];
  archivedSessions: ArchivedSession[];
  escalatedRooms: EscalatedRoom[];

  // Admin ayrı listeler
  chatMessagesAdmin: ChatMessage[];
  sessionsAdmin: ChatSession[];
  activeSessionsAdmin: ChatSession[];
  archivedSessionsAdmin: ArchivedSession[];

  loading: boolean;
  error: string | null;
  manualMessage: ManualMessageState;
}

const initialState: ChatState = {
  roomId: "",
  chatMessages: [],
  sessions: [],
  activeSessions: [],
  archivedSessions: [],
  chatMessagesAdmin: [],
  sessionsAdmin: [],
  activeSessionsAdmin: [],
  archivedSessionsAdmin: [],
  escalatedRooms: [],
  loading: false,
  error: null,
  manualMessage: { loading: false, success: false, error: null },
};

// --- Async Thunks ---

// PUBLIC
export const fetchMessagesByRoom = createAsyncThunk<ChatMessage[], string, { rejectValue: any }>(
  "chat/fetchMessagesByRoom",
  async (roomId, { rejectWithValue }) => await apiCall("get", `/chat/${roomId}`, null, rejectWithValue)
);
export const fetchAllChatSessions = createAsyncThunk<ChatSession[], void, { rejectValue: any }>(
  "chat/fetchAllChatSessions",
  async (_, { rejectWithValue }) => await apiCall("get", "/chat/sessions", null, rejectWithValue)
);
export const fetchActiveChatSessions = createAsyncThunk<ChatSession[], void, { rejectValue: any }>(
  "chat/fetchActiveChatSessions",
  async (_, { rejectWithValue }) => await apiCall("get", "/chat/sessions/active", null, rejectWithValue)
);
export const fetchArchivedSessions = createAsyncThunk<ArchivedSession[], void, { rejectValue: any }>(
  "chat/fetchArchivedSessions",
  async (_, { rejectWithValue }) => await apiCall("get", "/chat/archived", null, rejectWithValue)
);
export const markMessagesAsRead = createAsyncThunk<void, string, { rejectValue: any }>(
  "chat/markMessagesAsRead",
  async (roomId, { rejectWithValue }) => await apiCall("patch", `/chat/read/${roomId}`, null, rejectWithValue)
);
export const sendUserMessage = createAsyncThunk<ChatMessage, { roomId: string; message: string }, { rejectValue: any }>(
  "chat/sendUserMessage",
  async (payload, { rejectWithValue }) => await apiCall("post", "/chat/message", payload, rejectWithValue)
);

// ADMIN
export const fetchMessagesByRoomAdmin = createAsyncThunk<ChatMessage[], string, { rejectValue: any }>(
  "chat/fetchMessagesByRoomAdmin",
  async (roomId, { rejectWithValue }) => await apiCall("get", `/chat/admin/${roomId}`, null, rejectWithValue)
);
export const fetchAllChatSessionsAdmin = createAsyncThunk<ChatSession[], void, { rejectValue: any }>(
  "chat/fetchAllChatSessionsAdmin",
  async (_, { rejectWithValue }) => await apiCall("get", "/chat/admin/sessions", null, rejectWithValue)
);
export const fetchActiveChatSessionsAdmin = createAsyncThunk<ChatSession[], void, { rejectValue: any }>(
  "chat/fetchActiveChatSessionsAdmin",
  async (_, { rejectWithValue }) => await apiCall("get", "/chat/admin/sessions/active", null, rejectWithValue)
);
export const fetchArchivedSessionsAdmin = createAsyncThunk<ArchivedSession[], void, { rejectValue: any }>(
  "chat/fetchArchivedSessionsAdmin",
  async (_, { rejectWithValue }) => await apiCall("get", "/chat/admin/archived", null, rejectWithValue)
);
export const sendManualMessage = createAsyncThunk<ChatMessage, {
  roomId: string;
  message: string;
  close?: boolean;
}, { rejectValue: any }>(
  "chat/sendManualMessage",
  async (payload, { rejectWithValue }) => await apiCall("post", "/chat/admin/manual", payload, rejectWithValue)
);

// --- SLICE ---
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setRoomId(state, action: PayloadAction<string>) {
      state.roomId = action.payload;
      state.chatMessages = [];
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      if (!state.chatMessages.some((msg) => msg._id === action.payload._id)) {
        state.chatMessages.push(action.payload);
      }
    },
    addMessageAdmin(state, action: PayloadAction<ChatMessage>) {
      if (!state.chatMessagesAdmin.some((msg) => msg._id === action.payload._id)) {
        state.chatMessagesAdmin.push(action.payload);
      }
    },
    clearChatMessages(state) {
      state.chatMessages = [];
    },
    clearManualMessageState(state) {
      state.manualMessage = { loading: false, success: false, error: null };
    },
    addEscalatedRoom(state, action: PayloadAction<EscalatedRoom>) {
      state.escalatedRooms.push(action.payload);
    },
    clearEscalatedRooms(state) {
      state.escalatedRooms = [];
    }
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
      .addCase(fetchAllChatSessions.fulfilled, (state, action) => {
        state.sessions = action.payload;
      })
      .addCase(fetchActiveChatSessions.fulfilled, (state, action) => {
        state.activeSessions = action.payload;
      })
      .addCase(fetchArchivedSessions.fulfilled, (state, action) => {
        state.archivedSessions = action.payload;
      })
      .addCase(sendUserMessage.pending, (state) => {
        state.manualMessage.loading = true;
        state.manualMessage.error = null;
        state.manualMessage.success = false;
      })
      .addCase(sendUserMessage.fulfilled, (state, action) => {
        state.manualMessage.loading = false;
        state.manualMessage.success = true;
        state.chatMessages.push(action.payload);
      })
      .addCase(sendUserMessage.rejected, (state, action) => {
        state.manualMessage.loading = false;
        state.manualMessage.error =
          action.payload?.message || "Mesaj gönderilemedi.";
      });

    // ADMIN
    builder
      .addCase(fetchMessagesByRoomAdmin.fulfilled, (state, action) => {
        state.chatMessagesAdmin = action.payload;
      })
      .addCase(fetchAllChatSessionsAdmin.fulfilled, (state, action) => {
        state.sessionsAdmin = action.payload;
      })
      .addCase(fetchActiveChatSessionsAdmin.fulfilled, (state, action) => {
        state.activeSessionsAdmin = action.payload;
      })
      .addCase(fetchArchivedSessionsAdmin.fulfilled, (state, action) => {
        state.archivedSessionsAdmin = action.payload;
      })
      .addCase(sendManualMessage.fulfilled, (state, action) => {
        state.manualMessage.success = true;
        state.manualMessage.loading = false;
        // adminde mesajı ekle:
        state.chatMessagesAdmin.push(action.payload);
      })
      .addCase(sendManualMessage.pending, (state) => {
        state.manualMessage.loading = true;
        state.manualMessage.error = null;
        state.manualMessage.success = false;
      })
      .addCase(sendManualMessage.rejected, (state, action) => {
        state.manualMessage.loading = false;
        state.manualMessage.error =
          action.payload?.message || "Manuel mesaj gönderilemedi.";
      });
  },
});

// --- Actions ---
export const {
  setRoomId,
  addMessage,
  addMessageAdmin,
  addEscalatedRoom,
  clearEscalatedRooms,
  clearChatMessages,
  clearManualMessageState,
} = chatSlice.actions;


export default chatSlice.reducer;



export const selectChatRoomId = (state: RootState) => state.chat.roomId;
export const selectChatMessagesAdmin = (state: RootState) => state.chat.chatMessagesAdmin;
export const selectManualMessageState = (state: RootState) => state.chat.manualMessage;
export const selectChatMessages = (state: RootState) => state.chat.chatMessages;
export const selectChatSessions = (state: RootState) => state.chat.sessions;
export const selectActiveChatSessions = (state: RootState) => state.chat.activeSessions;
export const selectArchivedSessions = (state: RootState) => state.chat.archivedSessions;
export const selectChatSessionsAdmin = (state: RootState) => state.chat.sessionsAdmin;
export const selectActiveChatSessionsAdmin = (state: RootState) => state.chat.activeSessionsAdmin;
export const selectArchivedSessionsAdmin = (state: RootState) => state.chat.archivedSessionsAdmin;
export const selectChatLoading = (state: RootState) => state.chat.loading;
export const selectChatError = (state: RootState) => state.chat.error;
export const selectChatMessagesByRoom = (state: RootState) => state.chat.chatMessages;
export const selectAllChatSessionsAdmin = (state: RootState) => state.chat.sessionsAdmin;
export const selectEscalatedRooms = (state: RootState) => state.chat.escalatedRooms;

