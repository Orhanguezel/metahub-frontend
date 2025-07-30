import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { INotification } from "../types";

interface NotificationState {
  notifications: INotification[];
  loading: boolean;
  status?: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  message: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  status: "idle",
  error: null,
  message: null,
};

// 🔸 Bildirimleri çek
export const fetchNotifications = createAsyncThunk<
  INotification[],
  void,
  { rejectValue: string }
>("notification/fetchNotifications", async (_, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", "/notification");
    return res.notifications;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Could not fetch notifications.");
  }
});

// 🔸 Bildirim oluştur
export const createNotification = createAsyncThunk<
  INotification,
  Partial<Omit<INotification, "_id" | "createdAt" | "updatedAt">>,
  { rejectValue: string }
>("notification/createNotification", async (data, { rejectWithValue }) => {
  try {
    const res = await apiCall("post", "/notification", data);
    return res.notification;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Could not create notification.");
  }
});

// 🔸 Bildirim sil
export const deleteNotification = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notification/deleteNotification", async (id, { rejectWithValue }) => {
  try {
    await apiCall("delete", `/notification/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Could not delete notification.");
  }
});

// 🔸 Tek bildirimi okundu işaretle
export const markNotificationAsRead = createAsyncThunk<
  INotification,
  string,
  { rejectValue: string }
>("notification/markNotificationAsRead", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("patch", `/notification/${id}/read`);
    return res.notification;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Could not update notification.");
  }
});

// 🔸 Tüm bildirimleri okundu işaretle
export const markAllNotificationsAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("notification/markAllNotificationsAsRead", async (_, { rejectWithValue }) => {
  try {
    await apiCall("patch", "/notification/mark-all-read");
    return;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Could not update all notifications.");
  }
});

// Slice
const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearNotificationMessages(state) {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<INotification[]>) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch error";
      })
      // Create
      .addCase(createNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createNotification.fulfilled, (state, action: PayloadAction<INotification>) => {
        state.loading = false;
        state.notifications.unshift(action.payload);
        state.message = "Notification created successfully.";
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Create error";
      })
      // Delete
      .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<string>) => {
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
        state.message = "Notification deleted.";
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload || "Delete error";
      })
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action: PayloadAction<INotification>) => {
        state.notifications = state.notifications.map(n =>
          n._id === action.payload._id ? action.payload : n
        );
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload || "Update error";
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload || "Update error";
      });
  },
});

export const { clearNotificationMessages } = notificationSlice.actions;
export default notificationSlice.reducer;
