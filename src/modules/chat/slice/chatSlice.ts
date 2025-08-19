import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { RootState } from "@/store";
import type {
  ChatMessage,
  ChatSession,
  ArchivedSession,
  EscalatedRoom,
} from "@/modules/chat/types";

type ApiWrap<T> = { success?: boolean; data?: T; message?: string } | T;
const unwrap = <T>(res: ApiWrap<T>): T => (res as any)?.data ?? (res as T);

// ---------- Helpers ----------
const computeTotal = (map: Record<string, number>) =>
  Object.values(map).reduce((a, b) => a + (b || 0), 0);

// ---------- State ----------
type RoomPageState = {
  page: number;
  limit: number;
  sort: "asc" | "desc";
  hasMore: boolean;
};

export type ChatState = {
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error?: string | null;
  successMessage?: string | null;

  currentRoomId?: string;
  /** Chat penceresi açık mı? (unread artırma davranışı için) */
  isChatOpen: boolean;

  // Mesajlar oda bazında
  messagesByRoom: Record<string, ChatMessage[]>;
  pageByRoom: Record<string, RoomPageState>;

  // Unread sayaçları
  unreadByRoom: Record<string, number>;
  totalUnread: number;

  // Public görünüm
  lastMessages: ChatMessage[];
  activeSessions: ChatSession[];

  // Admin görünüm
  admin: {
    lastMessages: ChatMessage[];
    activeSessions: ChatSession[];
    archivedSessions: ArchivedSession[];
    allSessions: ChatSession[];
  };

  // (Opsiyonel) Escalation görünümü
  escalatedRooms: EscalatedRoom[];
};

const BASE = "/chat";

const initialState: ChatState = {
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
  currentRoomId: undefined,
  isChatOpen: false,
  messagesByRoom: {},
  pageByRoom: {},
  unreadByRoom: {},
  totalUnread: 0,
  lastMessages: [],
  activeSessions: [],
  admin: {
    lastMessages: [],
    activeSessions: [],
    archivedSessions: [],
    allSessions: [],
  },
  escalatedRooms: [],
};

// ---------- Thunks (PUBLIC) ----------
export const fetchRoomMessages = createAsyncThunk<
  { roomId: string; items: ChatMessage[]; page: number; limit: number; sort: "asc" | "desc" },
  { roomId: string; page?: number; limit?: number; sort?: "asc" | "desc" },
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/fetchRoomMessages", async ({ roomId, page = 1, limit = 20, sort = "asc" }, { rejectWithValue }) => {
  const q = `?page=${page}&limit=${limit}&sort=${sort}`;
  const res = await apiCall("get", `${BASE}/${encodeURIComponent(roomId)}${q}`, null, rejectWithValue);
  const data = unwrap<ChatMessage[]>(res);
  return { roomId, items: data, page, limit, sort };
});

export const sendUserMessage = createAsyncThunk<
  { roomId: string; message: ChatMessage },
  { roomId: string; message: string },
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/sendUserMessage", async ({ roomId, message }, { rejectWithValue }) => {
  const res = await apiCall("post", `${BASE}/message`, { roomId, message }, rejectWithValue);
  const { data } = (res || {}) as any;
  return { roomId, message: data as ChatMessage };
});

export const markRoomMessagesRead = createAsyncThunk<
  { roomId: string },
  { roomId: string },
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/markRoomMessagesRead", async ({ roomId }, { rejectWithValue }) => {
  await apiCall("patch", `${BASE}/read/${encodeURIComponent(roomId)}`, null, rejectWithValue);
  return { roomId };
});

export const fetchActiveChatSessions = createAsyncThunk<
  ChatSession[],
  void,
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/fetchActiveChatSessions", async (_arg, { rejectWithValue }) => {
  const res = await apiCall("get", `${BASE}/sessions/active`, null, rejectWithValue);
  return unwrap<ChatSession[]>(res);
});

export const fetchAllRoomsLastMessages = createAsyncThunk<
  ChatMessage[],
  void,
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/fetchAllRoomsLastMessages", async (_arg, { rejectWithValue }) => {
  const res = await apiCall("get", `${BASE}/`, null, rejectWithValue);
  return unwrap<ChatMessage[]>(res);
});

// ---------- Thunks (ADMIN) ----------
export const adminGetAllRoomsLastMessages = createAsyncThunk<
  ChatMessage[],
  void,
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/adminGetAllRoomsLastMessages", async (_arg, { rejectWithValue }) => {
  const res = await apiCall("get", `${BASE}/admin/`, null, rejectWithValue);
  return unwrap<ChatMessage[]>(res);
});

export const adminSendManualMessage = createAsyncThunk<
  { roomId: string; message: ChatMessage },
  { roomId: string; message: string; close?: boolean },
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/adminSendManualMessage", async ({ roomId, message, close = false }, { rejectWithValue }) => {
  const res = await apiCall("post", `${BASE}/admin/manual`, { roomId, message, close }, rejectWithValue);
  const { data } = (res || {}) as any;
  return { roomId, message: data as ChatMessage };
});

export const adminMarkMessagesRead = createAsyncThunk<
  { roomId: string },
  { roomId: string },
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/adminMarkMessagesRead", async ({ roomId }, { rejectWithValue }) => {
  await apiCall("patch", `${BASE}/admin/read/${encodeURIComponent(roomId)}`, null, rejectWithValue);
  return { roomId };
});

export const adminGetArchivedSessions = createAsyncThunk<
  ArchivedSession[],
  void,
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/adminGetArchivedSessions", async (_arg, { rejectWithValue }) => {
  const res = await apiCall("get", `${BASE}/admin/archived`, null, rejectWithValue);
  return unwrap<ArchivedSession[]>(res);
});

export const adminGetActiveSessions = createAsyncThunk<
  ChatSession[],
  void,
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/adminGetActiveSessions", async (_arg, { rejectWithValue }) => {
  const res = await apiCall("get", `${BASE}/admin/sessions/active`, null, rejectWithValue);
  return unwrap<ChatSession[]>(res);
});

export const adminGetAllSessions = createAsyncThunk<
  ChatSession[],
  void,
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/adminGetAllSessions", async (_arg, { rejectWithValue }) => {
  const res = await apiCall("get", `${BASE}/admin/sessions`, null, rejectWithValue);
  return unwrap<ChatSession[]>(res);
});

export const adminDeleteMessage = createAsyncThunk<
  { id: string },
  { id: string },
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/adminDeleteMessage", async ({ id }, { rejectWithValue }) => {
  await apiCall("delete", `${BASE}/admin/${encodeURIComponent(id)}`, null, rejectWithValue);
  return { id };
});

export const adminBulkDeleteMessages = createAsyncThunk<
  { deletedCount?: number; ids: string[] },
  { ids: string[] },
  { rejectValue: { status: any; message: string; data?: any } }
>("chat/adminBulkDeleteMessages", async ({ ids }, { rejectWithValue }) => {
  const res = await apiCall("post", `${BASE}/admin/bulk`, { ids }, rejectWithValue);
  const data = (res as any)?.data || {};
  return { deletedCount: data.deletedCount, ids };
});

// ---------- Slice ----------
export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentRoom(state, action: PayloadAction<string | undefined>) {
      state.currentRoomId = action.payload;
    },

    /** Chat modal/penceresi açık-kapalı */
    setChatOpen(state, action: PayloadAction<boolean>) {
      state.isChatOpen = action.payload;
    },

    /** Socket.IO'dan gelen mesajı ekle + gerekirse unread artır */
    messageReceived(state, action: PayloadAction<ChatMessage>) {
      const msg = action.payload;
      const roomId = msg.roomId;
      if (!state.messagesByRoom[roomId]) state.messagesByRoom[roomId] = [];
      state.messagesByRoom[roomId].push(msg);

      // lastMessages listesini güncel tut
      const idxPublic = state.lastMessages.findIndex((m) => m.roomId === roomId);
      if (idxPublic >= 0) state.lastMessages[idxPublic] = msg;
      else state.lastMessages.unshift(msg);

      const idxAdmin = state.admin.lastMessages.findIndex((m) => m.roomId === roomId);
      if (idxAdmin >= 0) state.admin.lastMessages[idxAdmin] = msg;
      else state.admin.lastMessages.unshift(msg);

      // Unread artır: chat açık ve aynı odadaysak artırma
      const active = state.isChatOpen && state.currentRoomId === roomId;
      if (!active) {
        state.unreadByRoom[roomId] = (state.unreadByRoom[roomId] || 0) + 1;
        state.totalUnread = computeTotal(state.unreadByRoom);
      }
    },

    clearChatError(state) {
      state.error = null;
      state.successMessage = null;
    },

    // (Opsiyonel) Unread manual delta/hydrate
    incrementUnread(state, action: PayloadAction<{ roomId: string; count?: number }>) {
      const { roomId, count = 1 } = action.payload;
      state.unreadByRoom[roomId] = Math.max(0, (state.unreadByRoom[roomId] || 0) + count);
      state.totalUnread = computeTotal(state.unreadByRoom);
    },
    resetUnread(state, action: PayloadAction<string /* roomId */>) {
      const roomId = action.payload;
      state.unreadByRoom[roomId] = 0;
      state.totalUnread = computeTotal(state.unreadByRoom);
    },
    hydrateUnread(state, action: PayloadAction<Record<string, number>>) {
      state.unreadByRoom = action.payload || {};
      state.totalUnread = computeTotal(state.unreadByRoom);
    },

    // (Opsiyonel) Escalation yönetimi
    setEscalatedRooms(state, action: PayloadAction<EscalatedRoom[]>) {
      state.escalatedRooms = action.payload ?? [];
    },
    addEscalatedRoom(state, action: PayloadAction<EscalatedRoom>) {
      const r = action.payload;
      const exists = state.escalatedRooms.some((x) => x.room === r.room);
      if (!exists) state.escalatedRooms.unshift(r);
    },
    removeEscalatedRoom(state, action: PayloadAction<string /* roomId */>) {
      state.escalatedRooms = state.escalatedRooms.filter((x) => x.room !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // === PUBLIC ===
    builder.addCase(fetchRoomMessages.pending, (state) => {
      state.loading = true; state.status = "loading"; state.error = null;
    });
    builder.addCase(fetchRoomMessages.fulfilled, (state, action) => {
      state.loading = false; state.status = "succeeded";
      const { roomId, items, page, limit, sort } = action.payload;
      const prev = state.messagesByRoom[roomId] || [];
      state.messagesByRoom[roomId] = page > 1 ? [...prev, ...items] : items;
      state.pageByRoom[roomId] = {
        page, limit, sort,
        hasMore: items.length >= limit,
      };
    });
    builder.addCase(fetchRoomMessages.rejected, (state, action) => {
      state.loading = false; state.status = "failed";
      state.error = action.payload?.message || "Mesajlar alınamadı.";
    });

    builder.addCase(sendUserMessage.pending, (state) => {
      state.loading = true; state.status = "loading"; state.error = null;
    });
    builder.addCase(sendUserMessage.fulfilled, (state, action) => {
      state.loading = false; state.status = "succeeded";
      const { roomId, message } = action.payload;
      if (!state.messagesByRoom[roomId]) state.messagesByRoom[roomId] = [];
      state.messagesByRoom[roomId].push(message);

      const idxPublic = state.lastMessages.findIndex((m) => m.roomId === roomId);
      if (idxPublic >= 0) state.lastMessages[idxPublic] = message;
      else state.lastMessages.unshift(message);

      state.successMessage = "chat.send.success";
      // Kendi gönderdiğimiz mesaj unread’i artırmaz.
    });
    builder.addCase(sendUserMessage.rejected, (state, action) => {
      state.loading = false; state.status = "failed";
      state.error = action.payload?.message || "Mesaj gönderilemedi.";
    });

    builder.addCase(markRoomMessagesRead.fulfilled, (state, action) => {
      const { roomId } = action.payload;
      const arr = state.messagesByRoom[roomId] || [];
      arr.forEach((m) => { m.isRead = true; });
      // Unread sıfırla
      state.unreadByRoom[roomId] = 0;
      state.totalUnread = computeTotal(state.unreadByRoom);
    });

    builder.addCase(fetchActiveChatSessions.fulfilled, (state, action) => {
      state.activeSessions = action.payload;
    });

    builder.addCase(fetchAllRoomsLastMessages.fulfilled, (state, action) => {
      state.lastMessages = action.payload;
    });

    // === ADMIN ===
    builder.addCase(adminGetAllRoomsLastMessages.fulfilled, (state, action) => {
      state.admin.lastMessages = action.payload;
    });

    builder.addCase(adminSendManualMessage.fulfilled, (state, action) => {
      const { roomId, message } = action.payload;
      if (!state.messagesByRoom[roomId]) state.messagesByRoom[roomId] = [];
      state.messagesByRoom[roomId].push(message);

      const idxAdmin = state.admin.lastMessages.findIndex((m) => m.roomId === roomId);
      if (idxAdmin >= 0) state.admin.lastMessages[idxAdmin] = message;
      else state.admin.lastMessages.unshift(message);

      state.successMessage = "sendMessage.success";
      // Admin gönderimi de unread’i artırmaz (kullanıcı tarafında inbound).
    });

    builder.addCase(adminMarkMessagesRead.fulfilled, (state, action) => {
      const { roomId } = action.payload;
      const arr = state.messagesByRoom[roomId] || [];
      arr.forEach((m) => { m.isRead = true; });
    });

    builder.addCase(adminGetArchivedSessions.fulfilled, (state, action) => {
      state.admin.archivedSessions = action.payload;
    });

    builder.addCase(adminGetActiveSessions.fulfilled, (state, action) => {
      state.admin.activeSessions = action.payload;
    });

    builder.addCase(adminGetAllSessions.fulfilled, (state, action) => {
      state.admin.allSessions = action.payload;
    });

    builder.addCase(adminDeleteMessage.fulfilled, (state, action) => {
      const { id } = action.payload;
      // Tüm odalarda bu id’yi çıkar
      Object.keys(state.messagesByRoom).forEach((r) => {
        state.messagesByRoom[r] = state.messagesByRoom[r].filter((m) => m._id !== id);
      });
      // lastMessages ve admin.lastMessages içinden de temizle
      state.lastMessages = state.lastMessages.filter((m) => m._id !== id);
      state.admin.lastMessages = state.admin.lastMessages.filter((m) => m._id !== id);
      state.successMessage = "delete.success";
    });

    builder.addCase(adminBulkDeleteMessages.fulfilled, (state, action) => {
      const { ids } = action.payload;
      const idSet = new Set(ids);
      Object.keys(state.messagesByRoom).forEach((r) => {
        state.messagesByRoom[r] = state.messagesByRoom[r].filter((m) => !idSet.has(m._id));
      });
      state.lastMessages = state.lastMessages.filter((m) => !idSet.has(m._id));
      state.admin.lastMessages = state.admin.lastMessages.filter((m) => !idSet.has(m._id));
      state.successMessage = "delete.success";
    });

    // Genel rejected
    builder.addMatcher(
      (a) => a.type.startsWith("chat/") && a.type.endsWith("/rejected"),
      (state, action: any) => {
        state.loading = false; state.status = "failed";
        state.error = action.payload?.message || action.error?.message || "İşlem sırasında hata oluştu.";
      }
    );
  },
});

export const {
  setCurrentRoom,
  setChatOpen,
  messageReceived,
  clearChatError,
  incrementUnread,
  resetUnread,
  hydrateUnread,
  // opsiyonel escalation aksiyonları
  setEscalatedRooms,
  addEscalatedRoom,
  removeEscalatedRoom,
} = chatSlice.actions;

// ---------- Selectors ----------
export const selectChatState = (s: RootState) => s.chat as ChatState;
export const selectCurrentRoomId = (s: RootState) => (s.chat as ChatState).currentRoomId;
export const selectIsChatOpen = (s: RootState) => (s.chat as ChatState).isChatOpen;
export const selectMessagesByRoom = (roomId: string) => (s: RootState) => (s.chat as ChatState).messagesByRoom[roomId] || [];
export const selectRoomPageState = (roomId: string) => (s: RootState) => (s.chat as ChatState).pageByRoom[roomId];
export const selectLastMessages = (s: RootState) => (s.chat as ChatState).lastMessages;
export const selectActiveSessions = (s: RootState) => (s.chat as ChatState).activeSessions;
export const selectAdmin = (s: RootState) => (s.chat as ChatState).admin;
// 🔹 Unread selector’lar
export const selectUnreadByRoom = (roomId: string) => (s: RootState) => (s.chat as ChatState).unreadByRoom[roomId] ?? 0;
export const selectTotalUnread = (s: RootState) => (s.chat as ChatState).totalUnread;
// 🔹 Escalated listesi
export const selectEscalatedRooms = (s: RootState) => (s.chat as ChatState).escalatedRooms;

export default chatSlice.reducer;
