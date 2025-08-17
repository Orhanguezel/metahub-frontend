import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IActivity } from "@/modules/activity";

interface ActivityState {
  activity: IActivity[];
  activityAdmin: IActivity[];
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

const BASE = "/activity";

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
    const res = await apiCall("get", `${BASE}`, null, thunkAPI.rejectWithValue);
    // response: { success, message, data }
    return res.data;
  }
);

export const fetchAllActivityAdmin = createAsyncThunk<IActivity[]>(
  "activity/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `${BASE}/admin`,
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
      `${BASE}/admin`,
      formData,
      thunkAPI.rejectWithValue
    );
    // return: { success, message, data }
    return { ...res, data: res.data };
  }
);

export const updateActivity = createAsyncThunk(
  "activity/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `${BASE}/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data };
  }
);

export const deleteActivity = createAsyncThunk(
  "activity/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `${BASE}/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    // return: { success, message }
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
      `${BASE}/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data };
  }
);

export const fetchActivityBySlug = createAsyncThunk(
  "activity/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `${BASE}/slug/${slug}`,
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
    clearActivityMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedActivity: (state, action: PayloadAction<IActivity | null>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: ActivityState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };

    const setError = (state: ActivityState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public
    builder
      .addCase(fetchActivity.pending, setLoading)
      .addCase(fetchActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.activity = action.payload;
      })
      .addCase(fetchActivity.rejected, setError);

    // 🔐 Admin List
    builder
      .addCase(fetchAllActivityAdmin.pending, setLoading)
      .addCase(fetchAllActivityAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.activityAdmin = action.payload;
      })
      .addCase(fetchAllActivityAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createActivity.pending, setLoading)
      .addCase(createActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.activityAdmin.unshift(action.payload.data);
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(createActivity.rejected, setError);

    // 📝 Update
    builder
      .addCase(updateActivity.pending, setLoading)
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.activityAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.activityAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(updateActivity.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deleteActivity.pending, setLoading)
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.activityAdmin = state.activityAdmin.filter((a) => a._id !== action.payload.id);
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(deleteActivity.rejected, setError);

    // 🌍 Toggle Publish
    builder
      .addCase(togglePublishActivity.pending, setLoading)
      .addCase(togglePublishActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.activityAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.activityAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(togglePublishActivity.rejected, setError);

    // 🔎 Single (Slug)
    builder
      .addCase(fetchActivityBySlug.pending, setLoading)
      .addCase(fetchActivityBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchActivityBySlug.rejected, setError);
  },
});

export const { clearActivityMessages, setSelectedActivity } = activitySlice.actions;
export default activitySlice.reducer;
