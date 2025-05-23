import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface ActivityCategory {
  _id: string;
  name: {
    tr: string;
    en: string;
    de: string;
  };
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

// ✅ Fetch all categories
export const fetchActivityCategories = createAsyncThunk(
  "activityCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/activitycategory", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Create category
export const createActivityCategory = createAsyncThunk(
  "activityCategory/create",
  async (
    data: {
      name: { tr: string; en: string; de: string };
      description?: string;
    },
    thunkAPI
  ) => {
    const res = await apiCall("post", "/activitycategory", data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Update category
export const updateActivityCategory = createAsyncThunk(
  "activityCategory/update",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        name: { tr: string; en: string; de: string };
        description?: string;
      };
    },
    thunkAPI
  ) => {
    const res = await apiCall("put", `/activitycategory/${id}`, data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Delete category
export const deleteActivityCategory = createAsyncThunk(
  "activityCategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/activitycategory/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

const activityCategorySlice = createSlice({
  name: "activityCategory",
  initialState,
  reducers: {
    clearCategoryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: CategoryState) => {
      state.loading = true;
      state.error = null;
    };

    const onError = (state: CategoryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "Something went wrong.";
    };

    builder
      // 🔄 Fetch
      .addCase(fetchActivityCategories.pending, startLoading)
      .addCase(fetchActivityCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchActivityCategories.rejected, onError)

      // ➕ Create
      .addCase(createActivityCategory.pending, startLoading)
      .addCase(createActivityCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        if (action.payload && action.payload._id) {
          state.categories.unshift(action.payload);
        }
      })
      .addCase(createActivityCategory.rejected, onError)

      // ✏️ Update
      .addCase(updateActivityCategory.pending, startLoading)
      .addCase(updateActivityCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category updated successfully.";
        const updated = action.payload;
        const index = state.categories.findIndex((cat) => cat._id === updated._id);
        if (index !== -1) {
          state.categories[index] = updated;
        }
      })
      .addCase(updateActivityCategory.rejected, onError)

      // ❌ Delete
      .addCase(deleteActivityCategory.pending, startLoading)
      .addCase(deleteActivityCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      })
      .addCase(deleteActivityCategory.rejected, onError);
  },
});

export const { clearCategoryMessages } = activityCategorySlice.actions;
export default activityCategorySlice.reducer;
