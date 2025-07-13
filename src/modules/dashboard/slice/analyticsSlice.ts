import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { AnalyticsEvent, AnalyticsState } from "../types";

const initialState: AnalyticsState = {
  events: [],
  count: 0,
  trends: [],
  loading: false,
  error: null,
};

// Event loglama
export const logAnalyticsEvent = createAsyncThunk(
  "analytics/logEvent",
  async (data: Partial<AnalyticsEvent>, thunkAPI) =>
    await apiCall("post", "/analytics/events", data, thunkAPI.rejectWithValue)
);

// Event listesi (filtrelenmiş ya da parametresiz)
export const fetchAnalyticsEvents = createAsyncThunk(
  "analytics/fetchEvents",
  async (query: Record<string, any> = {}, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/analytics/events",
      query,
      thunkAPI.rejectWithValue
    );
    return res;
  }
);

// Sayı (opsiyonel filtre ile)
export const fetchAnalyticsCount = createAsyncThunk(
  "analytics/fetchCount",
  async (query: Record<string, any> = {}, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/analytics/count",
      query,
      thunkAPI.rejectWithValue
    );
    return res;
  }
);

// Trend (opsiyonel filtre ile)
export const fetchAnalyticsTrends = createAsyncThunk(
  "analytics/fetchTrends",
  async (query: Record<string, any> = {}, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/analytics/trends",
      query,
      thunkAPI.rejectWithValue
    );
    return res;
  }
);

// Eventleri topluca sil (filter ile)
export const deleteAnalyticsEvents = createAsyncThunk(
  "analytics/deleteEvents",
  async (data: Record<string, any> = {}, thunkAPI) =>
    await apiCall("delete", "/analytics/events", data, thunkAPI.rejectWithValue)
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalyticsState: (state) => {
      state.events = [];
      state.count = 0;
      state.trends = [];
      state.loading = false;
      state.error = null;
    },
    clearAnalyticsMessage: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Eventler
      .addCase(fetchAnalyticsEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsEvents.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // Backend data alanını her iki şekilde de yakala
        if (Array.isArray(action.payload?.data)) {
          state.events = action.payload.data;
          state.count = action.payload.count ?? action.payload.data.length;
        } else if (Array.isArray(action.payload)) {
          state.events = action.payload;
          state.count = action.payload.length;
        } else {
          state.events = [];
          state.count = 0;
        }
      })
      .addCase(fetchAnalyticsEvents.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Error fetching events";
      });

    builder
      // Count
      .addCase(fetchAnalyticsCount.fulfilled, (state, action: PayloadAction<any>) => {
        state.count = typeof action.payload?.count === "number" ? action.payload.count : 0;
      });

    builder
      // Trendler
      .addCase(fetchAnalyticsTrends.fulfilled, (state, action: PayloadAction<any>) => {
        if (Array.isArray(action.payload?.data)) {
          state.trends = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.trends = action.payload;
        } else {
          state.trends = [];
        }
      });

    // Diğer toplu işlemler eklenebilir.
  },
});

export const { clearAnalyticsState, clearAnalyticsMessage } = analyticsSlice.actions;
export default analyticsSlice.reducer;
