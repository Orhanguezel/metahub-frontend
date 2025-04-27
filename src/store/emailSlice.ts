// src/store/emailSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface Email {
  _id: string;
  from?: string;
  to: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailState {
  emails: Email[];
  selectedEmail: Email | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: EmailState = {
  emails: [],
  selectedEmail: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 📥 Get all mails
export const fetchEmails = createAsyncThunk("email/fetchEmails", async (_, thunkAPI) => {
  return await apiCall("get", "/emails", null, thunkAPI.rejectWithValue);
});

// 📧 Get single mail
export const getEmailById = createAsyncThunk("email/getEmailById", async (id: string, thunkAPI) => {
  return await apiCall("get", `/emails/${id}`, null, thunkAPI.rejectWithValue);
});

// 🗑️ Delete mail
export const deleteEmail = createAsyncThunk("email/deleteEmail", async (id: string, thunkAPI) => {
  return await apiCall("delete", `/emails/${id}`, null, thunkAPI.rejectWithValue);
});

// 📬 Send test email
export const sendTestEmail = createAsyncThunk(
  "email/sendTestEmail",
  async (payload: { to: string; subject: string; message: string }, thunkAPI) => {
    return await apiCall("post", "/emails/send-test", payload, thunkAPI.rejectWithValue);
  }
);

// 🔁 Trigger manual inbox fetch
export const fetchInboxManually = createAsyncThunk("email/fetchInboxManually", async (_, thunkAPI) => {
  return await apiCall("get", "/emails/fetch-inbox", null, thunkAPI.rejectWithValue);
});

// 📌 Mark as read/unread
export const markEmailReadState = createAsyncThunk(
  "email/markEmailReadState",
  async ({ id, isRead }: { id: string; isRead: boolean }, thunkAPI) => {
    return await apiCall("patch", `/emails/mark/${id}`, { isRead }, thunkAPI.rejectWithValue);
  }
);

const emailSlice = createSlice({
  name: "email",
  initialState,
  reducers: {
    clearEmailMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: EmailState) => {
      state.loading = true;
      state.error = null;
    };
    const errorReducer = (state: EmailState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchEmails.pending, loadingReducer)
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.emails = action.payload;
      })
      .addCase(fetchEmails.rejected, errorReducer)

      .addCase(getEmailById.pending, loadingReducer)
      .addCase(getEmailById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEmail = action.payload;
      })
      .addCase(getEmailById.rejected, errorReducer)

      .addCase(deleteEmail.pending, loadingReducer)
      .addCase(deleteEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Nachricht wurde gelöscht.";
        state.emails = state.emails.filter((m) => m._id !== action.payload?._id);
      })
      .addCase(deleteEmail.rejected, errorReducer)

      .addCase(sendTestEmail.pending, loadingReducer)
      .addCase(sendTestEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Testnachricht gesendet.";
      })
      .addCase(sendTestEmail.rejected, errorReducer)

      .addCase(fetchInboxManually.pending, loadingReducer)
      .addCase(fetchInboxManually.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "E-Mails werden überprüft...";
      })
      .addCase(fetchInboxManually.rejected, errorReducer)

      .addCase(markEmailReadState.pending, loadingReducer)
      .addCase(markEmailReadState.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        const updated = action.payload.mail;
        const index = state.emails.findIndex((m) => m._id === updated._id);
        if (index !== -1) state.emails[index] = updated;
      })
      .addCase(markEmailReadState.rejected, errorReducer);
  },
});

export const { clearEmailMessages } = emailSlice.actions;
export default emailSlice.reducer;
