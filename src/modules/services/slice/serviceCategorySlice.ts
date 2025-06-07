import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface ServiceCategory {
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
  categories: ServiceCategory[];
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
export const fetchServiceCategories = createAsyncThunk(
  "serviceCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/servicescategory", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Create category
export const createServiceCategory = createAsyncThunk(
  "serviceCategory/create",
  async (
    data: {
      name: { tr: string; en: string; de: string };
      description?: string;
    },
    thunkAPI
  ) => {
    const res = await apiCall("post", "/servicescategory", data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Update category
export const updateServiceCategory = createAsyncThunk(
  "serviceCategory/update",
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
    const res = await apiCall("put", `/servicescategory/${id}`, data, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ✅ Delete category
export const deleteServiceCategory = createAsyncThunk(
  "serviceCategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/servicescategory/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

const serviceCategorySlice = createSlice({
  name: "serviceCategory",
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
      .addCase(fetchServiceCategories.pending, startLoading)
      .addCase(fetchServiceCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchServiceCategories.rejected, onError)

      // ➕ Create
      .addCase(createServiceCategory.pending, startLoading)
      .addCase(createServiceCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        if (action.payload && action.payload._id) {
          state.categories.unshift(action.payload);
        }
      })
      .addCase(createServiceCategory.rejected, onError)

      // ✏️ Update
      .addCase(updateServiceCategory.pending, startLoading)
      .addCase(updateServiceCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category updated successfully.";
        const updated = action.payload;
        const index = state.categories.findIndex((cat) => cat._id === updated._id);
        if (index !== -1) {
          state.categories[index] = updated;
        }
      })
      .addCase(updateServiceCategory.rejected, onError)

      // ❌ Delete
      .addCase(deleteServiceCategory.pending, startLoading)
      .addCase(deleteServiceCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      })
      .addCase(deleteServiceCategory.rejected, onError);
  },
});

export const { clearCategoryMessages } = serviceCategorySlice.actions;
export default serviceCategorySlice.reducer;
