// src/store/dashboardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

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

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
  successMessage: null,
};

// ✅ Dashboard verilerini getir
export const getDashboardStats = createAsyncThunk(
  "dashboard/getStats",
  async (_, thunkAPI) =>
    await apiCall("get", "/dashboard", null, thunkAPI.rejectWithValue)
);

// Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetDashboardStats: (state) => {
      state.stats = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getDashboardStats.fulfilled,
        (state, action: PayloadAction<{ success: boolean; message: string; stats: DashboardStats }>) => {
          state.loading = false;
          state.stats = action.payload.stats;
          state.successMessage = action.payload.message;
        }
      )
      .addCase(getDashboardStats.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Dashboard verileri alınamadı.";
      });
  },
});

export const { clearDashboardMessages, resetDashboardStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
