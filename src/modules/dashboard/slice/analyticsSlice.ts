import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { AnalyticsEvent, AnalyticsState, ApiEnvelope } from "../types";

export type AnalyticsListParams = {
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  module?: string;
  eventType?: string;
};

export const fetchAnalyticsEvents = createAsyncThunk<
  { events: AnalyticsEvent[]; count: number; message?: string },
  AnalyticsListParams | undefined,
  { rejectValue: { status: number | string; message: string } }
>("analytics/fetchList", async (params, { rejectWithValue }) => {
  const res = await apiCall("get", "/analytics", params ?? {}, rejectWithValue);
  const env = (res?.data ?? res) as ApiEnvelope<{ events: AnalyticsEvent[]; count: number }> | any;

  if (env?.success === false) {
    return rejectWithValue({ status: 400, message: env?.message || "Failed" });
  }

  const events = env?.data?.events ?? env?.events ?? [];
  const count = env?.data?.count ?? env?.count ?? events.length;
  return { events, count, message: env?.message };
});

const initialState: AnalyticsState = {
  events: [],
  count: 0,
  trends: [],
  loading: false,
  error: null,
  successMessage: null,
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalyticsError(state) {
      state.error = null;
    },
    resetAnalytics(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(fetchAnalyticsEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events;
        state.count = action.payload.count;
        state.successMessage = action.payload.message ?? "OK";
      })
      .addCase(fetchAnalyticsEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Fetch analytics failed";
      });
  },
});

export const { clearAnalyticsError, resetAnalytics } = analyticsSlice.actions;

/* Selectors */
export const selectAnalytics = (s: any) => s.analytics as AnalyticsState;
export const selectAnalyticsEvents = (s: any) => (s.analytics as AnalyticsState).events;
export const selectAnalyticsLoading = (s: any) => (s.analytics as AnalyticsState).loading;

export default analyticsSlice.reducer;
