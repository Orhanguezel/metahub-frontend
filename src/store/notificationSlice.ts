// src/store/notificationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface Notification {
  _id?: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  user?: string | null;
  createdAt?: string;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  successMessage: null,
};

// 📥 Get All
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, thunkAPI) =>
    await apiCall("get", "/notifications", null, thunkAPI.rejectWithValue)
);

// ➕ Create
export const createNotification = createAsyncThunk(
  "notification/createNotification",
  async (
    data: { title: string; message: string; type: string; user?: string },
    thunkAPI
  ) => await apiCall("post", "/notifications", data, thunkAPI.rejectWithValue)
);

// 🗑️ Delete
export const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/notifications/${id}`, null, thunkAPI.rejectWithValue)
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearNotificationMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: NotificationState) => {
      state.loading = true;
      state.error = null;
    };

    const errorReducer = (state: NotificationState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchNotifications.pending, loadingReducer)
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, errorReducer);

    builder
      .addCase(createNotification.pending, loadingReducer)
      .addCase(createNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Benachrichtigung wurde erstellt.";
        state.notifications.unshift(action.payload.notification);
      })
      .addCase(createNotification.rejected, errorReducer);

    builder
      .addCase(deleteNotification.pending, loadingReducer)
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Benachrichtigung wurde gelöscht.";
        state.notifications = state.notifications.filter(
          (n) => n._id !== action.payload?.notification?._id
        );
      })
      .addCase(deleteNotification.rejected, errorReducer);
  },
});

export const { clearNotificationMessages } = notificationSlice.actions;
export default notificationSlice.reducer;
