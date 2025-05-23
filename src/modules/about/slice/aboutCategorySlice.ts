import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface AboutCategory {
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
  categories: AboutCategory[];
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
export const fetchAboutCategories = createAsyncThunk(
  "aboutCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/aboutcategory", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Create category
export const createAboutCategory = createAsyncThunk(
  "aboutCategory/create",
  async (
    data: {
      name: { tr: string; en: string; de: string };
      description?: string;
    },
    thunkAPI
  ) => {
    const res = await apiCall("post", "/aboutcategory", data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Update category
export const updateAboutCategory = createAsyncThunk(
  "aboutCategory/update",
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
    const res = await apiCall("put", `/aboutcategory/${id}`, data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Delete category
export const deleteAboutCategory = createAsyncThunk(
  "aboutCategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/aboutcategory/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

const aboutCategorySlice = createSlice({
  name: "aboutCategory",
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
      .addCase(fetchAboutCategories.pending, startLoading)
      .addCase(fetchAboutCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAboutCategories.rejected, onError)

      // ➕ Create
      .addCase(createAboutCategory.pending, startLoading)
      .addCase(createAboutCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        if (action.payload && action.payload._id) {
          state.categories.unshift(action.payload);
        }
      })
      .addCase(createAboutCategory.rejected, onError)

      // ✏️ Update
      .addCase(updateAboutCategory.pending, startLoading)
      .addCase(updateAboutCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category updated successfully.";
        const updated = action.payload;
        const index = state.categories.findIndex((cat) => cat._id === updated._id);
        if (index !== -1) {
          state.categories[index] = updated;
        }
      })
      .addCase(updateAboutCategory.rejected, onError)

      // ❌ Delete
      .addCase(deleteAboutCategory.pending, startLoading)
      .addCase(deleteAboutCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      })
      .addCase(deleteAboutCategory.rejected, onError);
  },
});

export const { clearCategoryMessages } = aboutCategorySlice.actions;
export default aboutCategorySlice.reducer;
