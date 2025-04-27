import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ICategory } from "@/types/category";

interface CategoryState {
  categories: ICategory[];
  selectedCategory: ICategory | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  successMessage: null,
};

// ✅ Get All Categories
export const fetchCategories = createAsyncThunk<ICategory[], void, { rejectValue: string }>(
  "categories/fetchAll",
  async (_, thunkAPI) =>
    await apiCall("get", "/categories", null, thunkAPI.rejectWithValue)
);

// ✅ Get Single Category
export const fetchCategoryById = createAsyncThunk<ICategory, string, { rejectValue: string }>(
  "categories/fetchById",
  async (id, thunkAPI) =>
    await apiCall("get", `/categories/${id}`, null, thunkAPI.rejectWithValue)
);

// ✅ Create Category (with FormData)
export const createCategory = createAsyncThunk<ICategory, FormData, { rejectValue: string }>(
  "category/create",
  async (formData, thunkAPI) =>
    await apiCall("post", "/categories", formData, thunkAPI.rejectWithValue, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
);

// ✅ Update Category
export const updateCategory = createAsyncThunk<
  ICategory,
  { id: string; data: Partial<ICategory> },
  { rejectValue: string }
>("categories/update", async ({ id, data }, thunkAPI) => {
  const res = await apiCall("put", `/categories/${id}`, data, thunkAPI.rejectWithValue);
  return res.category;
});

// ✅ Delete Category
export const deleteCategory = createAsyncThunk<void, string, { rejectValue: string }>(
  "categories/delete",
  async (id, thunkAPI) =>
    await apiCall("delete", `/categories/${id}`, null, thunkAPI.rejectWithValue)
);

// 🔧 Slice
const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearCategoryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Kategoriler alınamadı.";
      })

      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.selectedCategory = action.payload;
      })

      .addCase(createCategory.fulfilled, (state, action) => {
        state.successMessage = "Kategori oluşturuldu.";
        state.categories.unshift(action.payload);
      })

      .addCase(updateCategory.fulfilled, (state, action) => {
        state.successMessage = "Kategori güncellendi.";
        const index = state.categories.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.categories[index] = action.payload;
        if (state.selectedCategory?._id === action.payload._id) {
          state.selectedCategory = action.payload;
        }
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        const deletedId = action.meta.arg;
        state.successMessage = "Kategori silindi.";
        state.categories = state.categories.filter((c) => c._id !== deletedId);
      })

      // Ortak hata yakalama
      .addMatcher(
        (action) =>
          action.type.startsWith("category/") || action.type.startsWith("categories/") &&
          action.type.endsWith("/rejected"),
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload || "Beklenmedik bir hata oluştu.";
        }
      );
  },
});

export const { clearCategoryMessages } = categorySlice.actions;
export default categorySlice.reducer;
