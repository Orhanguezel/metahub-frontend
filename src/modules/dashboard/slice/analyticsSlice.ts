import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { AnalyticsEvent, AnalyticsState } from "@/modules/dashboard/types";

const initialState: AnalyticsState = {
  events: [],
  count: 0,
  trends: [],
  loading: false,
  error: null,
};

export const logAnalyticsEvent = createAsyncThunk(
  "analytics/logEvent",
  async (data: Partial<AnalyticsEvent>, thunkAPI) =>
    await apiCall("post", "/analytics/events", data, thunkAPI.rejectWithValue)
);

// Anahtar: burada backend cevabını return ederken doğrudan response’u dönüyoruz!
export const fetchAnalyticsEvents = createAsyncThunk(
  "analytics/fetchEvents",
  async (query: Record<string, any>, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/analytics/events",
      query,
      thunkAPI.rejectWithValue
    );
    return res; // NOT: res.data değil!
  }
);

export const fetchAnalyticsCount = createAsyncThunk(
  "analytics/fetchCount",
  async (query: Record<string, any>, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/analytics/count",
      query,
      thunkAPI.rejectWithValue
    );
    return res;
  }
);

export const fetchAnalyticsTrends = createAsyncThunk(
  "analytics/fetchTrends",
  async (query: Record<string, any>, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/analytics/trends",
      query,
      thunkAPI.rejectWithValue
    );
    return res;
  }
);

export const deleteAnalyticsEvents = createAsyncThunk(
  "analytics/deleteEvents",
  async (data: Record<string, any>, thunkAPI) =>
    await apiCall("delete", "/analytics/events", data, thunkAPI.rejectWithValue)
);

// NOT: Burada da aynısı! result.data yerine result döndürülürse flatMap çalışır!
export const fetchAnalyticsForActiveModules = createAsyncThunk(
  "analytics/fetchAnalyticsForActiveModules",
  async (project: string, thunkAPI) => {
    try {
      const activeModulesRes = await apiCall(
        "get",
        `/admin/enabled-modules?project=${project}`,
        null,
        thunkAPI.rejectWithValue,
        { withCredentials: true }
      );
      const activeModules: string[] = activeModulesRes?.data ?? [];
      const analyticsPromises = activeModules.map((module: string) =>
        apiCall(
          "get",
          `/analytics/events?module=${module}&project=${project}`,
          null,
          thunkAPI.rejectWithValue,
          { withCredentials: true }
        )
      );
      const analyticsResults = await Promise.all(analyticsPromises);
      // her biri {success, count, data: []} döndürüyor
      return analyticsResults.flatMap((result: any) => result.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// --- SLICE ---
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
  },
  extraReducers: (builder) => {
    builder
      // Analytics event listesi (dikkat: action.payload.data!)
      .addCase(fetchAnalyticsEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAnalyticsEvents.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          // Defensive: eğer dizi yoksa boş array ata
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
        }
      )

      .addCase(
        fetchAnalyticsEvents.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload?.message || "Error fetching events";
        }
      );

    builder
      .addCase(
        fetchAnalyticsCount.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.count =
            typeof action.payload?.count === "number"
              ? action.payload.count
              : 0;
        }
      )

      .addCase(
        fetchAnalyticsTrends.fulfilled,
        (state, action: PayloadAction<any>) => {
          if (Array.isArray(action.payload?.data)) {
            state.trends = action.payload.data;
          } else if (Array.isArray(action.payload)) {
            state.trends = action.payload;
          } else {
            state.trends = [];
          }
        }
      );

    builder
      .addCase(fetchAnalyticsForActiveModules.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchAnalyticsForActiveModules.fulfilled,
        (state, action: PayloadAction<AnalyticsEvent[]>) => {
          state.events = action.payload;
          state.loading = false;
        }
      )
      .addCase(
        fetchAnalyticsForActiveModules.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error =
            action.payload?.message || "Error fetching analytics data";
        }
      );
  },
});

export const { clearAnalyticsState } = analyticsSlice.actions;
export default analyticsSlice.reducer;
