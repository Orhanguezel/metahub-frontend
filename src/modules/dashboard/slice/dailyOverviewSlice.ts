import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// /dashboard/daily-overview -> { data: { newUsers, newOrders, revenueToday, feedbacksToday } }
export interface DailyOverview {
  newUsers: number;
  newOrders: number;
  revenueToday: number;
  feedbacksToday: number;
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

export const fetchDailyOverview = createAsyncThunk(
  "dailyOverview/fetchToday",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/dashboard/daily-overview", null, thunkAPI.rejectWithValue);
    return res.data.data as DailyOverview;
  }
);

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
