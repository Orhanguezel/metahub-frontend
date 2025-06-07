import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface RadonarCategory {
  _id: string;
  name: { tr: string; en: string; de: string };
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: RadonarCategory[];
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

// ✅ Fetch All
export const fetchRadonarCategories = createAsyncThunk(
  "radonarCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/radonarcategory", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Create
export const createRadonarCategory = createAsyncThunk(
  "radonarCategory/create",
  async (
    data: { name: { tr: string; en: string; de: string }; description?: string },
    thunkAPI
  ) => {
    const res = await apiCall("post", "/radonarcategory", data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Update
export const updateRadonarCategory = createAsyncThunk(
  "radonarCategory/update",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: { name: { tr: string; en: string; de: string }; description?: string };
    },
    thunkAPI
  ) => {
    const res = await apiCall("put", `/radonarcategory/${id}`, data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Delete
export const deleteRadonarCategory = createAsyncThunk(
  "radonarCategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/radonarcategory/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

const radonarCategorySlice = createSlice({
  name: "radonarCategory",
  initialState,
  reducers: {
    clearCategoryMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchRadonarCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRadonarCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchRadonarCategories.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch categories.";
      })

      // CREATE
      .addCase(createRadonarCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRadonarCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        state.categories.unshift(action.payload);
      })
      .addCase(createRadonarCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create category.";
      })

      // UPDATE
      .addCase(updateRadonarCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRadonarCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category updated successfully.";
        const updated = action.payload;
        const index = state.categories.findIndex((cat) => cat._id === updated._id);
        if (index !== -1) state.categories[index] = updated;
      })
      .addCase(updateRadonarCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update category.";
      })

      // DELETE
      .addCase(deleteRadonarCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRadonarCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      })
      .addCase(deleteRadonarCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete category.";
      });
  },
});

export const { clearCategoryMessages } = radonarCategorySlice.actions;
export default radonarCategorySlice.reducer;
