// src/modules/dashboard/slice/dashboardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// API: /dashboard → { stats: { ... } }
export interface DashboardStats {
  [key: string]: number | undefined;
  revenue?: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk<DashboardStats>(
  "dashboard/fetchStats",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/dashboard", null, thunkAPI.rejectWithValue);
    // Doğru yapı: { success, message, stats }
    if (res?.stats) {
      return res.stats as DashboardStats;
    }
    // Fallback: hata fırlat
    return thunkAPI.rejectWithValue("Dashboard stats not found.");
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboardStats: (state) => {
      state.stats = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        // Hata tipi bazen string bazen object olabiliyor!
        if (typeof action.payload === "string") {
          state.error = action.payload;
        } else if (typeof action.payload === "object" && action.payload !== null && "message" in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error = "Dashboard stats yüklenemedi.";
        }
      });
  },
});

export const { clearDashboardError, resetDashboardStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
