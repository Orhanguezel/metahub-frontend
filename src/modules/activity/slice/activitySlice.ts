import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IActivity } from "@/modules/activity";

interface ActivityState {
  activity: IActivity[]; // Public (site) için
  activityAdmin: IActivity[]; // Admin panel için
  selected: IActivity | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ActivityState = {
  activity: [],
  activityAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof (payload as any).message === "string"
  )
    return (payload as any).message;
  return "An error occurred.";
};

// --- Async Thunks ---

export const fetchActivity = createAsyncThunk<IActivity[]>(
  "activity/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/activity`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const fetchAllActivityAdmin = createAsyncThunk<IActivity[]>(
  "activity/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/activity/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const createActivity = createAsyncThunk(
  "activity/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/activity/admin",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const updateActivity = createAsyncThunk(
  "activity/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/activity/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const deleteActivity = createAsyncThunk(
  "activity/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/activity/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

export const togglePublishActivity = createAsyncThunk(
  "activity/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/activity/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const fetchActivityBySlug = createAsyncThunk(
  "activity/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/activity/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    clearActivityMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedActivity(state, action: PayloadAction<IActivity | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: ActivityState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: ActivityState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = extractErrorMessage(action.payload);
    };

    // --- Public List ---
    builder
      .addCase(fetchActivity.pending, startLoading)
      .addCase(fetchActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activity = action.payload;
      })
      .addCase(fetchActivity.rejected, setError);

    // --- Admin List ---
    builder
      .addCase(fetchAllActivityAdmin.pending, startLoading)
      .addCase(fetchAllActivityAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.activityAdmin = action.payload;
      })
      .addCase(fetchAllActivityAdmin.rejected, setError);

    // --- Admin Create ---
    builder
      .addCase(createActivity.pending, startLoading)
      .addCase(createActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        if (action.payload?.data) {
          state.activityAdmin.unshift(action.payload.data);
        }
      })
      .addCase(createActivity.rejected, setError);

    // --- Admin Update ---
    builder
      .addCase(updateActivity.pending, startLoading)
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.activityAdmin.findIndex(
          (a) => a._id === updated._id
        );
        if (index !== -1) state.activityAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(updateActivity.rejected, setError);

    // --- Admin Delete ---
    builder
      .addCase(deleteActivity.pending, startLoading)
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activityAdmin = state.activityAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload?.message;
      })
      .addCase(deleteActivity.rejected, setError);

    // --- Admin Toggle Publish ---
    builder
      .addCase(togglePublishActivity.pending, startLoading)
      .addCase(togglePublishActivity.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.activityAdmin.findIndex(
          (a) => a._id === updated._id
        );
        if (index !== -1) state.activityAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(togglePublishActivity.rejected, setError);

    // --- Single Fetch (slug) ---
    builder
      .addCase(fetchActivityBySlug.pending, startLoading)
      .addCase(fetchActivityBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchActivityBySlug.rejected, setError);
  },
});

export const { clearActivityMessages, setSelectedActivity } =
  activitySlice.actions;
export default activitySlice.reducer;
