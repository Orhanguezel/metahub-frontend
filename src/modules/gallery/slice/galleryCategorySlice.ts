import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IGalleryCategory } from "../types";

interface CategoryState {
  categories: IGalleryCategory[];         // Public (veya global)
  adminCategories: IGalleryCategory[];    // Admin paneli için ayrı
  selected: IGalleryCategory | null;
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}

const initialState: CategoryState = {
  categories: [],
  adminCategories: [],
  selected: null,
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
};

// 🌍 Fetch All (Public)
export const fetchGalleryCategories = createAsyncThunk(
  "gallerycategory/fetchAll",
  async (_: void, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/gallerycategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🌍 Fetch All (Admin)
export const fetchAdminGalleryCategories = createAsyncThunk(
  "gallerycategory/fetchAllAdmin",
  async (_: void, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/gallerycategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ➕ Create (FormData)
export const createGalleryCategory = createAsyncThunk(
  "gallerycategory/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/gallerycategory",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

// ✏️ Update (FormData)
export const updateGalleryCategory = createAsyncThunk(
  "gallerycategory/update",
  async (params: { id: string; data: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/gallerycategory/${params.id}`,
      params.data,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

// ❌ Delete
export const deleteGalleryCategory = createAsyncThunk(
  "gallerycategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall(
      "delete",
      `/gallerycategory/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return id;
  }
);

const galleryCategorySlice = createSlice({
  name: "galleryCategory",
  initialState,
  reducers: {
    clearGalleryCategoryMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    clearSelectedCategory(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    // Common loading/failed helpers
    const loading = (state: CategoryState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };
    const failed = (state: CategoryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = action.payload?.message || "An error occurred.";
    };

    builder
      // PUBLIC fetch
      .addCase(fetchGalleryCategories.pending, loading)
      .addCase(fetchGalleryCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchGalleryCategories.rejected, failed)

      // ADMIN fetch
      .addCase(fetchAdminGalleryCategories.pending, loading)
      .addCase(fetchAdminGalleryCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminCategories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAdminGalleryCategories.rejected, failed)

      // CREATE
      .addCase(createGalleryCategory.pending, loading)
      .addCase(createGalleryCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload?.message || "Category created successfully.";
        if (action.payload && action.payload._id) {
          state.categories.unshift(action.payload);
          state.adminCategories.unshift(action.payload);
        }
      })
      .addCase(createGalleryCategory.rejected, failed)

      // UPDATE
      .addCase(updateGalleryCategory.pending, loading)
      .addCase(updateGalleryCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload?.message || "Category updated successfully.";
        const updated = action.payload;
        if (updated && updated._id) {
          const idx = state.categories.findIndex((cat) => cat._id === updated._id);
          if (idx !== -1) state.categories[idx] = updated;
          const adminIdx = state.adminCategories.findIndex((cat) => cat._id === updated._id);
          if (adminIdx !== -1) state.adminCategories[adminIdx] = updated;
          if (state.selected?._id === updated._id) state.selected = updated;
        }
      })
      .addCase(updateGalleryCategory.rejected, failed)

      // DELETE
      .addCase(deleteGalleryCategory.pending, loading)
      .addCase(deleteGalleryCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload
        );
        state.adminCategories = state.adminCategories.filter(
          (cat) => cat._id !== action.payload
        );
        if (state.selected?._id === action.payload) state.selected = null;
      })
      .addCase(deleteGalleryCategory.rejected, failed);
  },
});

export const { clearGalleryCategoryMessages, clearSelectedCategory } =
  galleryCategorySlice.actions;
export default galleryCategorySlice.reducer;
