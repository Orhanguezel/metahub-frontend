import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { IGalleryCategory } from "@/modules/gallery/types";
import { TranslatedLabel } from "@/types/common";

interface CategoryState {
  categories: IGalleryCategory[];
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
export const fetchGalleryCategories = createAsyncThunk(
  "galleryCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/gallerycategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ✅ Create category
export const createGalleryCategory = createAsyncThunk(
  "galleryCategory/create",
  async (
    data: {
      name: TranslatedLabel;
      description?: TranslatedLabel;
      isActive?: boolean;
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "post",
      "/gallerycategory",
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ✅ Update category
export const updateGalleryCategory = createAsyncThunk(
  "galleryCategory/update",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        name: TranslatedLabel;
        description?: TranslatedLabel;
        isActive?: boolean;
      };
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "put",
      `/gallerycategory/${id}`,
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ✅ Delete category
export const deleteGalleryCategory = createAsyncThunk(
  "galleryCategory/delete",
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
    clearGalleryCategoryMessages: (state) => {
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
      .addCase(fetchGalleryCategories.pending, startLoading)
      .addCase(fetchGalleryCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchGalleryCategories.rejected, onError)

      // ➕ Create
      .addCase(createGalleryCategory.pending, startLoading)
      .addCase(createGalleryCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        if (action.payload && action.payload._id) {
          state.categories.unshift(action.payload);
        }
      })
      .addCase(createGalleryCategory.rejected, onError)

      // ✏️ Update
      .addCase(updateGalleryCategory.pending, startLoading)
      .addCase(updateGalleryCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category updated successfully.";
        const updated = action.payload;
        const index = state.categories.findIndex(
          (cat) => cat._id === updated._id
        );
        if (index !== -1) {
          state.categories[index] = updated;
        }
      })
      .addCase(updateGalleryCategory.rejected, onError)

      // ❌ Delete
      .addCase(deleteGalleryCategory.pending, startLoading)
      .addCase(deleteGalleryCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload
        );
      })
      .addCase(deleteGalleryCategory.rejected, onError);
  },
});

export const { clearGalleryCategoryMessages } = galleryCategorySlice.actions;
export default galleryCategorySlice.reducer;
