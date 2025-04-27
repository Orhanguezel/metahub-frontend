// src/store/dashboard/dailyOverviewSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// 📊 Günlük veri tipi
export interface DailyOverview {
  date: string;
  newUsers: number;
  orders: number;
  revenue: number;
  feedbacks: number;
}

interface DailyOverviewState {
  today: DailyOverview | null;
  loading: boolean;
  error: string | null;
}

const initialState: DailyOverviewState = {
  today: null,
  loading: false,
  error: null,
};

// 🔄 Thunk: Bugüne ait özet bilgileri getir
export const fetchDailyOverview = createAsyncThunk(
  "dailyOverview/fetchToday",
  async (_, thunkAPI) =>
    await apiCall("get", "/dashboard/overview/today", null, thunkAPI.rejectWithValue)
);

// 📦 Slice
const dailyOverviewSlice = createSlice({
  name: "dailyOverview",
  initialState,
  reducers: {
    clearDailyOverviewError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyOverview.fulfilled, (state, action: PayloadAction<DailyOverview>) => {
        state.loading = false;
        state.today = action.payload;
      })
      .addCase(fetchDailyOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDailyOverviewError } = dailyOverviewSlice.actions;
export default dailyOverviewSlice.reducer;
