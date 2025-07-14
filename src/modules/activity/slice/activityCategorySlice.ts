import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ActivityCategory, TranslatedField } from "@/modules/activity";

interface CategoryState {
  categories: ActivityCategory[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  successMessage: null,
};

// --- Fetch ---
export const fetchActivityCategories = createAsyncThunk(
  "activityCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/activitycategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Create ---
export const createActivityCategory = createAsyncThunk(
  "activityCategory/create",
  async (
    data: {
      name: TranslatedField;
      description?: TranslatedField;
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "post",
      "/activitycategory",
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Update ---
export const updateActivityCategory = createAsyncThunk(
  "activityCategory/update",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        name: TranslatedField;
        description?: TranslatedField;
      };
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "put",
      `/activitycategory/${id}`,
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Delete ---
export const deleteActivityCategory = createAsyncThunk(
  "activityCategory/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/activitycategory/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

const activityCategorySlice = createSlice({
  name: "activityCategory",
  initialState,
  reducers: {
    clearActivityCategoryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: CategoryState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: CategoryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message;
    };

    builder
      // Fetch
      .addCase(fetchActivityCategories.pending, startLoading)
      .addCase(fetchActivityCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchActivityCategories.rejected, setError)
      // Create
      .addCase(createActivityCategory.pending, startLoading)
      .addCase(createActivityCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        if (action.payload?.data?._id) {
          state.categories.unshift(action.payload.data);
        }
      })
      .addCase(createActivityCategory.rejected, setError)
      // Update
      .addCase(updateActivityCategory.pending, startLoading)
      .addCase(updateActivityCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        const updated = action.payload?.data || action.payload;
        const index = state.categories.findIndex(
          (cat) => cat._id === updated._id
        );
        if (index !== -1) {
          state.categories[index] = updated;
        }
      })
      .addCase(updateActivityCategory.rejected, setError)
      // Delete
      .addCase(deleteActivityCategory.pending, startLoading)
      .addCase(deleteActivityCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload.id
        );
      })
      .addCase(deleteActivityCategory.rejected, setError);
  },
});

export const { clearActivityCategoryMessages } = activityCategorySlice.actions;
export default activityCategorySlice.reducer;
