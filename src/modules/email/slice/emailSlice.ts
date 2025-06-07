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

// 📥 Tüm e-postaları getir
export const fetchEmails = createAsyncThunk(
  "email/fetchEmails",
  async (_, thunkAPI) => {
    return await apiCall("get", "/email", null, thunkAPI.rejectWithValue);
  }
);

// 📧 Tek e-posta getir (ID ile)
export const getEmailById = createAsyncThunk(
  "email/getEmailById",
  async (id: string, thunkAPI) => {
    return await apiCall("get", `/email/${id}`, null, thunkAPI.rejectWithValue);
  }
);

// 🗑️ E-posta sil (ID ile)
export const deleteEmail = createAsyncThunk(
  "email/deleteEmail",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/email/${id}`, null, thunkAPI.rejectWithValue);
    return id; // Başarılıysa id dön
  }
);

// 📬 Test e-posta gönder (SMTP)
export const sendTestEmail = createAsyncThunk(
  "email/sendTestEmail",
  async (
    payload: { to: string; subject: string; message: string },
    thunkAPI
  ) => {
    return await apiCall("post", "/email/send", payload, thunkAPI.rejectWithValue);
  }
);

// 🔁 Manuel fetch (IMAP)
export const fetchInboxManually = createAsyncThunk(
  "email/fetchInboxManually",
  async (_, thunkAPI) => {
    return await apiCall("get", "/email/fetch", null, thunkAPI.rejectWithValue);
  }
);

// 📌 Okundu/okunmadı işaretle
export const markEmailReadState = createAsyncThunk(
  "email/markEmailReadState",
  async ({ id, isRead }: { id: string; isRead: boolean }, thunkAPI) => {
    return await apiCall(
      "patch",
      `/email/${id}/read`,
      { isRead },
      thunkAPI.rejectWithValue
    );
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
      state.successMessage = null;
    };
    const errorReducer = (state: EmailState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "Etwas ist schiefgelaufen!";
      state.successMessage = null;
    };

    builder
      .addCase(fetchEmails.pending, loadingReducer)
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.emails = action.payload || [];
      })
      .addCase(fetchEmails.rejected, errorReducer)

      .addCase(getEmailById.pending, loadingReducer)
      .addCase(getEmailById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEmail = action.payload || null;
      })
      .addCase(getEmailById.rejected, errorReducer)

      .addCase(deleteEmail.pending, loadingReducer)
      .addCase(deleteEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "E-Mail gelöscht.";
        state.emails = state.emails.filter((m) => m._id !== action.payload);
      })
      .addCase(deleteEmail.rejected, errorReducer)

      .addCase(sendTestEmail.pending, loadingReducer)
      .addCase(sendTestEmail.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Test-E-Mail gesendet.";
      })
      .addCase(sendTestEmail.rejected, errorReducer)

      .addCase(fetchInboxManually.pending, loadingReducer)
      .addCase(fetchInboxManually.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "E-Mails werden synchronisiert...";
      })
      .addCase(fetchInboxManually.rejected, errorReducer)

      .addCase(markEmailReadState.pending, loadingReducer)
      .addCase(markEmailReadState.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.successMessage = updated.isRead
          ? "Als gelesen markiert."
          : "Als ungelesen markiert.";
        const idx = state.emails.findIndex((m) => m._id === updated._id);
        if (idx !== -1) state.emails[idx] = updated;
        if (state.selectedEmail?._id === updated._id) {
          state.selectedEmail = updated;
        }
      })
      .addCase(markEmailReadState.rejected, errorReducer);
  },
});

export const { clearEmailMessages } = emailSlice.actions;
export default emailSlice.reducer;
