import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface ArticlesCategory {
  _id: string;
  name: { tr: string; en: string; de: string };
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: ArticlesCategory[];
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
export const fetchArticlesCategories = createAsyncThunk(
  "articlesCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/articlescategory", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Create
export const createArticlesCategory = createAsyncThunk(
  "articlesCategory/create",
  async (
    data: { name: { tr: string; en: string; de: string }; description?: string },
    thunkAPI
  ) => {
    const res = await apiCall("post", "/articlescategory", data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Update
export const updateArticlesCategory = createAsyncThunk(
  "articlesCategory/update",
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
    const res = await apiCall("put", `/articlescategory/${id}`, data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Delete
export const deleteArticlesCategory = createAsyncThunk(
  "articlesCategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/articlescategory/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

const articlesCategorySlice = createSlice({
  name: "articlesCategory",
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
      .addCase(fetchArticlesCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticlesCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchArticlesCategories.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch categories.";
      })

      // CREATE
      .addCase(createArticlesCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArticlesCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        state.categories.unshift(action.payload);
      })
      .addCase(createArticlesCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create category.";
      })

      // UPDATE
      .addCase(updateArticlesCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArticlesCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category updated successfully.";
        const updated = action.payload;
        const index = state.categories.findIndex((cat) => cat._id === updated._id);
        if (index !== -1) state.categories[index] = updated;
      })
      .addCase(updateArticlesCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update category.";
      })

      // DELETE
      .addCase(deleteArticlesCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArticlesCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      })
      .addCase(deleteArticlesCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete category.";
      });
  },
});

export const { clearCategoryMessages } = articlesCategorySlice.actions;
export default articlesCategorySlice.reducer;
