import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface ReferenceCategory {
  _id: string;
  name: {
    tr: string;
    en: string;
    de: string;
  };
  slug: string;
  description?: {
    tr?: string;
    en?: string;
    de?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: ReferenceCategory[];
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
export const fetchReferenceCategories = createAsyncThunk(
  "referenceCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/referencescategory", null, thunkAPI.rejectWithValue);
    // API response: { success: true, message: "...", data: [...] }
    return res.data;
  }
);

// ✅ Create category
export const createReferenceCategory = createAsyncThunk(
  "referenceCategory/create",
  async (
    data: {
      name: { tr: string; en: string; de: string };
      description?: { tr?: string; en?: string; de?: string };
    },
    thunkAPI
  ) => {
    const res = await apiCall("post", "/referencescategory", data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Update category
export const updateReferenceCategory = createAsyncThunk(
  "referenceCategory/update",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        name?: { tr?: string; en?: string; de?: string };
        description?: { tr?: string; en?: string; de?: string };
        isActive?: boolean;
      };
    },
    thunkAPI
  ) => {
    const res = await apiCall("put", `/referencescategory/${id}`, data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Delete category
export const deleteReferenceCategory = createAsyncThunk(
  "referenceCategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/referencescategory/${id}`, null, thunkAPI.rejectWithValue);
    return id; // Yalnızca id dönüyoruz
  }
);

const referenceCategorySlice = createSlice({
  name: "referenceCategory",
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
      .addCase(fetchReferenceCategories.pending, startLoading)
      .addCase(fetchReferenceCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchReferenceCategories.rejected, onError)

      // ➕ Create
      .addCase(createReferenceCategory.pending, startLoading)
      .addCase(createReferenceCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        if (action.payload && action.payload._id) {
          state.categories.unshift(action.payload);
        }
      })
      .addCase(createReferenceCategory.rejected, onError)

      // ✏️ Update
      .addCase(updateReferenceCategory.pending, startLoading)
      .addCase(updateReferenceCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category updated successfully.";
        const updated = action.payload;
        const index = state.categories.findIndex((cat) => cat._id === updated._id);
        if (index !== -1) {
          state.categories[index] = updated;
        }
      })
      .addCase(updateReferenceCategory.rejected, onError)

      // ❌ Delete
      .addCase(deleteReferenceCategory.pending, startLoading)
      .addCase(deleteReferenceCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      })
      .addCase(deleteReferenceCategory.rejected, onError);
  },
});

export const { clearCategoryMessages } = referenceCategorySlice.actions;
export default referenceCategorySlice.reducer;
