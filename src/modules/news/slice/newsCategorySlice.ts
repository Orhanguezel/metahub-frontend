import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface NewsCategory {
  _id: string;
  name: { tr: string; en: string; de: string };
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: NewsCategory[];
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
export const fetchNewsCategories = createAsyncThunk(
  "newsCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/newscategory", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Create
export const createNewsCategory = createAsyncThunk(
  "newsCategory/create",
  async (
    data: { name: { tr: string; en: string; de: string }; description?: string },
    thunkAPI
  ) => {
    const res = await apiCall("post", "/newscategory", data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Update
export const updateNewsCategory = createAsyncThunk(
  "newsCategory/update",
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
    const res = await apiCall("put", `/newscategory/${id}`, data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Delete
export const deleteNewsCategory = createAsyncThunk(
  "newsCategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/newscategory/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

const newsCategorySlice = createSlice({
  name: "newsCategory",
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
      .addCase(fetchNewsCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchNewsCategories.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch categories.";
      })

      // CREATE
      .addCase(createNewsCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewsCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        state.categories.unshift(action.payload);
      })
      .addCase(createNewsCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create category.";
      })

      // UPDATE
      .addCase(updateNewsCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNewsCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category updated successfully.";
        const updated = action.payload;
        const index = state.categories.findIndex((cat) => cat._id === updated._id);
        if (index !== -1) state.categories[index] = updated;
      })
      .addCase(updateNewsCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update category.";
      })

      // DELETE
      .addCase(deleteNewsCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNewsCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      })
      .addCase(deleteNewsCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete category.";
      });
  },
});

export const { clearCategoryMessages } = newsCategorySlice.actions;
export default newsCategorySlice.reducer;
