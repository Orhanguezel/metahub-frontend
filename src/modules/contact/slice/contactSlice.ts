import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IContactMessage } from "@/modules/contact/types";

interface ContactState {
  messages: IContactMessage[];          // Public (kullanıcıya gösterilen)
  messagesAdmin: IContactMessage[];     // Admin paneli için tüm mesajlar
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  deleteStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: ContactState = {
  messages: [],
  messagesAdmin: [],
  loading: false,
  error: null,
  successMessage: null,
  deleteStatus: "idle",
};

// 1️⃣ Public: Send contact message (herkese açık)
export const sendContactMessage = createAsyncThunk<
  IContactMessage,
  Omit<IContactMessage, "_id" | "isRead" | "isArchived" | "createdAt" | "updatedAt" | "tenant">
>(
  "contact/sendMessage",
  async (payload, thunkAPI) => {
    const res = await apiCall("post", "/contact", payload, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 2️⃣ Admin: Tüm mesajları getir
export const fetchAllContactMessages = createAsyncThunk<IContactMessage[]>(
  "contact/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/contact", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 3️⃣ Admin: Mesaj sil
export const deleteContactMessage = createAsyncThunk<
  string,  // payload: silinen mesajın _id'si
  string   // arg: id
>(
  "contact/delete",
  async (id, thunkAPI) => {
    await apiCall("delete", `/contact/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

// 4️⃣ Admin: Okundu işaretle
export const markContactMessageAsRead = createAsyncThunk<
  IContactMessage,
  string
>(
  "contact/markAsRead",
  async (id, thunkAPI) => {
    const res = await apiCall("patch", `/contact/${id}/read`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    clearContactMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.deleteStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // 1️⃣ Public: Send
      .addCase(sendContactMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendContactMessage.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Your message has been sent.";
      })
      .addCase(sendContactMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload) || "Failed to send message.";
      })

      // 2️⃣ Admin: fetchAll (tüm mesajlar)
      .addCase(fetchAllContactMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllContactMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messagesAdmin = action.payload;
      })
      .addCase(fetchAllContactMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload) || "Failed to fetch messages.";
      })

      // 3️⃣ Admin: delete
      .addCase(deleteContactMessage.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
      })
      .addCase(deleteContactMessage.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleteStatus = "succeeded";
        state.messagesAdmin = state.messagesAdmin.filter((msg) => msg._id !== action.payload);
        state.messages = state.messages.filter((msg) => msg._id !== action.payload);
        state.successMessage = "Message deleted successfully.";
      })
      .addCase(deleteContactMessage.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = String(action.payload) || "Failed to delete message.";
      })

      // 4️⃣ Admin: Okundu yap
      .addCase(markContactMessageAsRead.fulfilled, (state, action) => {
        state.messagesAdmin = state.messagesAdmin.map((msg) =>
          msg._id === action.payload._id ? action.payload : msg
        );
      });
  },
});

export const { clearContactMessages } = contactSlice.actions;
export default contactSlice.reducer;
