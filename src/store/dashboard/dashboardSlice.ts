"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// ✅ Tipler
interface DailyOverview {
  date: string;
  newUsers: number;
  orders: number;
  revenue: number;
  feedbacks: number;
}

export interface DashboardStats {
  users: number;
  products: number;
  blogs: number;
  news: number;
  articles: number;
  spareParts: number;
  library: number;
  references: number;
  carts: number;
  notifications: number;
  contactMessages: number;
  gallery: number;
  faqs: number;
  comments: number;
  settings: number;
  payments: number;
  services: number;
  emails: number;
  dailyOverview?: DailyOverview;
  mostSoldProduct?: string;
}

export interface AnalyticsItem {
  name: string;
  label: {
    tr?: string;
    en?: string;
    de?: string;
  };
  icon: string;
  count: number;
  statsKey?: string;
  showInDashboard?: boolean;
  order?: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  analytics: AnalyticsItem[];
  loading: boolean;
  error: string | null;
}

// ✅ Başlangıç Değeri
const initialState: DashboardState = {
  stats: null,
  analytics: [],
  loading: false,
  error: null,
};

// ✅ Dashboard istatistiklerini getir (/dashboard)
export const getDashboardStats = createAsyncThunk(
  "dashboard/getStats",
  async (_, thunkAPI) =>
    await apiCall("get", "/dashboard", null, thunkAPI.rejectWithValue)
);

// ✅ Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardMessages: (state) => {
      state.error = null;
    },
    resetDashboardStats: (state) => {
      state.stats = null;
      state.analytics = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📊 Dashboard genel istatistikleri
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getDashboardStats.fulfilled,
        (state, action: PayloadAction<{ success: boolean; message: string; stats: DashboardStats }>) => {
          state.loading = false;
          state.stats = action.payload.stats;
        }
      )
      .addCase(getDashboardStats.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Dashboard verileri alınamadı.";
      });
  },
});

// ✅ Exportlar
export const { clearDashboardMessages, resetDashboardStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
