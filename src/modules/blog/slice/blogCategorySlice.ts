import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface BlogCategory {
  _id: string;
  name: { tr: string; en: string; de: string };
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: BlogCategory[];
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
export const fetchBlogCategories = createAsyncThunk(
  "blogCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/blogcategory", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Create
export const createBlogCategory = createAsyncThunk(
  "blogCategory/create",
  async (
    data: { name: { tr: string; en: string; de: string }; description?: string },
    thunkAPI
  ) => {
    const res = await apiCall("post", "/blogcategory", data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Update
export const updateBlogCategory = createAsyncThunk(
  "blogCategory/update",
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
    const res = await apiCall("put", `/blogcategory/${id}`, data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Delete
export const deleteBlogCategory = createAsyncThunk(
  "blogCategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/blogcategory/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

const BlogCategorySlice = createSlice({
  name: "blogCategory",
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
      .addCase(fetchBlogCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchBlogCategories.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch categories.";
      })

      // CREATE
      .addCase(createBlogCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlogCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        state.categories.unshift(action.payload);
      })
      .addCase(createBlogCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create category.";
      })

      // UPDATE
      .addCase(updateBlogCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlogCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category updated successfully.";
        const updated = action.payload;
        const index = state.categories.findIndex((cat) => cat._id === updated._id);
        if (index !== -1) state.categories[index] = updated;
      })
      .addCase(updateBlogCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update category.";
      })

      // DELETE
      .addCase(deleteBlogCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlogCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      })
      .addCase(deleteBlogCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete category.";
      });
  },
});

export const { clearCategoryMessages } = BlogCategorySlice.actions;
export default BlogCategorySlice.reducer;
