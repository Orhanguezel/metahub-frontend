import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IActivity } from "@/modules/activity/types/activity";

interface ActivityState {
  activities: IActivity[];
  selected: IActivity | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ActivityState = {
  activities: [],
  selected: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 🌐 Public - fetch by language
export const fetchActivity = createAsyncThunk(
  "activity/fetchAll",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/activity?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ➕ Create Activity
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

// ✏️ Update Activity
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

// ❌ Delete Activity
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

// 🛠 Admin - fetch all Activities
export const fetchAllActivitiesAdmin = createAsyncThunk(
  "activity/fetchAllAdmin",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/activity/admin?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🔁 Toggle Publish
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

// 🌐 Fetch by Slug
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
      state.error = action.payload?.message || "An error occurred.";
    };

    builder
      .addCase(fetchActivity.pending, startLoading)
      .addCase(fetchActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivity.rejected, setError)

      .addCase(fetchAllActivitiesAdmin.pending, startLoading)
      .addCase(fetchAllActivitiesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchAllActivitiesAdmin.rejected, setError)

      .addCase(createActivity.pending, startLoading)
      .addCase(createActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Activity created successfully.";
        if (action.payload?._id) {
          state.activities.unshift(action.payload);
        }
      })
      .addCase(createActivity.rejected, setError)

      .addCase(updateActivity.pending, startLoading)
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.activities.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.activities[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = "Activity updated successfully.";
      })
      .addCase(updateActivity.rejected, setError)

      .addCase(deleteActivity.pending, startLoading)
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = state.activities.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = "Activity deleted successfully.";
      })
      .addCase(deleteActivity.rejected, setError)

      .addCase(togglePublishActivity.pending, startLoading)
      .addCase(togglePublishActivity.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.activities.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.activities[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = updated.isPublished
          ? "Activity published successfully."
          : "Activity unpublished successfully.";
      })
      .addCase(togglePublishActivity.rejected, setError)

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
