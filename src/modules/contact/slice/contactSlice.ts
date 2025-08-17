// src/modules/contact/slice/contactSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IContactMessage } from "@/modules/contact/types";

interface ContactState {
  messages: IContactMessage[];
  messagesAdmin: IContactMessage[];
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

const pickData = (res: any) => res?.data?.data ?? res?.data;

const BASE = "/contact";

// 1) Public: Send contact message
export const sendContactMessage = createAsyncThunk<
  IContactMessage,
  Omit<IContactMessage, "_id" | "isRead" | "isArchived" | "createdAt" | "updatedAt" | "tenant">,
  { rejectValue: string }
>("contact/sendMessage", async (payload, { rejectWithValue }) => {
  try {
    const res = await apiCall("post", `${BASE}`, payload, rejectWithValue);
    return pickData(res);
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to send message.");
  }
});

// 2) Admin: fetch all messages
export const fetchAllContactMessages = createAsyncThunk<
  IContactMessage[],
  void,
  { rejectValue: string }
>("contact/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", `${BASE}`, null, rejectWithValue);
    return pickData(res);
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to fetch messages.");
  }
});

// 3) Admin: delete message
export const deleteContactMessage = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("contact/delete", async (id, { rejectWithValue }) => {
  try {
    await apiCall("delete", `${BASE}/${id}`, null, rejectWithValue);
    return id;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to delete message.");
  }
});

// 4) Admin: mark as read
export const markContactMessageAsRead = createAsyncThunk<
  IContactMessage,
  string,
  { rejectValue: string }
>("contact/markAsRead", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("patch", `${BASE}/${id}/read`, null, rejectWithValue);
    return pickData(res);
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to mark as read.");
  }
});

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
      // send
      .addCase(sendContactMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(sendContactMessage.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Your message has been sent.";
      })
      .addCase(sendContactMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to send message.";
      })

      // fetch all
      .addCase(fetchAllContactMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllContactMessages.fulfilled, (state, action: PayloadAction<IContactMessage[]>) => {
        state.loading = false;
        state.messagesAdmin = action.payload;
      })
      .addCase(fetchAllContactMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch messages.";
      })

      // delete
      .addCase(deleteContactMessage.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteContactMessage.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleteStatus = "succeeded";
        state.messagesAdmin = state.messagesAdmin.filter((m) => m._id !== action.payload);
        state.messages = state.messages.filter((m) => m._id !== action.payload);
        state.successMessage = "Message deleted successfully.";
      })
      .addCase(deleteContactMessage.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = (action.payload as string) || "Failed to delete message.";
      })

      // mark read
      .addCase(markContactMessageAsRead.fulfilled, (state, action: PayloadAction<IContactMessage>) => {
        state.messagesAdmin = state.messagesAdmin.map((m) => (m._id === action.payload._id ? action.payload : m));
      });
  },
});

export const { clearContactMessages } = contactSlice.actions;
export default contactSlice.reducer;
