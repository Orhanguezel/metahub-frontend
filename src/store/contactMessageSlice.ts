import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface ContactMessage {
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: string;
}

interface ContactMessageState {
  messages: ContactMessage[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ContactMessageState = {
  messages: [],
  loading: false,
  error: null,
  successMessage: null,
};

// ✅ Kullanıcı mesaj gönderir
export const sendMessage = createAsyncThunk(
  "contact/sendMessage",
  async (data: Omit<ContactMessage, "_id" | "createdAt">, thunkAPI) =>
    await apiCall("post", "/contact", data, thunkAPI.rejectWithValue)
);

// ✅ Admin: Tüm mesajları getirir
export const fetchMessages = createAsyncThunk(
  "contact/fetchMessages",
  async (_, thunkAPI) =>
    await apiCall("get", "/contact", null, thunkAPI.rejectWithValue)
);

// ✅ Admin: Mesaj siler
export const deleteMessage = createAsyncThunk(
  "contact/deleteMessage",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/contact/${id}`, null, thunkAPI.rejectWithValue)
);

// Slice
const contactMessageSlice = createSlice({
  name: "contactMessage",
  initialState,
  reducers: {
    clearContactMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: ContactMessageState) => {
      state.loading = true;
      state.error = null;
    };

    const failed = (state: ContactMessageState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    // Gönder
    builder
      .addCase(sendMessage.pending, loading)
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(sendMessage.rejected, failed);

    // Get All
    builder
      .addCase(fetchMessages.pending, loading)
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, failed);

    // Delete
    builder
      .addCase(deleteMessage.pending, loading)
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.messages = state.messages.filter((msg) => msg._id !== action.meta.arg);
      })
      .addCase(deleteMessage.rejected, failed);
  },
});

export const { clearContactMessages } = contactMessageSlice.actions;
export default contactMessageSlice.reducer;
