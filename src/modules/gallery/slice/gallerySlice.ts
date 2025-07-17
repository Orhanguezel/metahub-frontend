import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import {
  IGallery,
  IGalleryCategory,
  IGalleryStats,
} from "@/modules/gallery/types";

// --- STATE ---
interface GalleryState {
  publicImages: IGallery[];      // Public, yayınlanan ve aktif
  adminImages: IGallery[];       // Admin, tüm kayıtlar
  categories: IGalleryCategory[];
  stats: IGalleryStats | null;
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}

const initialState: GalleryState = {
  publicImages: [],
  adminImages: [],
  stats: null,
  categories: [],
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
};

// --- ASYNC THUNKS ---

// Admin: Tüm galerileri getir
export const fetchGallery = createAsyncThunk(
  "gallery/fetchGallery",
  async (_, thunkAPI) =>
    await apiCall("get", "/gallery", null, thunkAPI.rejectWithValue)
);

// Public: Yalnızca yayınlanan ve aktif galerileri getir
export const fetchPublishedGalleryItems = createAsyncThunk(
  "gallery/fetchPublishedGalleryItems",
  async (_, thunkAPI) =>
    await apiCall("get", "/gallery/published", null, thunkAPI.rejectWithValue)
);

// Diğer işlemler değişmiyor...
export const searchGalleryItems = createAsyncThunk(
  "gallery/searchGalleryItems",
  async (params: any, thunkAPI) =>
    await apiCall("get", `/gallery/search`, params, thunkAPI.rejectWithValue)
);

export const uploadGalleryItem = createAsyncThunk(
  "gallery/uploadGalleryItem",
  async (formData: FormData, thunkAPI) =>
    await apiCall(
      "post",
      "/gallery/upload",
      formData,
      thunkAPI.rejectWithValue,
      {
        "Content-Type": "multipart/form-data",
      }
    )
);

export const updateGalleryItem = createAsyncThunk(
  "gallery/updateGalleryItem",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) =>
    await apiCall("put", `/gallery/${id}`, formData, thunkAPI.rejectWithValue, {
      "Content-Type": "multipart/form-data",
    })
);

// ... diğer admin işlemleri aynen devam eder ...

export const getGalleryStats = createAsyncThunk(
  "gallery/getGalleryStats",
  async (_, thunkAPI) =>
    await apiCall("get", `/gallery/stats`, null, thunkAPI.rejectWithValue)
);

export const fetchPublishedGalleryCategories = createAsyncThunk<
  IGalleryCategory[],
  void,
  { rejectValue: string }
>(
  "gallery/fetchPublishedGalleryCategories",
  async (_, thunkAPI) =>
    await apiCall("get", "/gallery/categories", null, thunkAPI.rejectWithValue)
);

export const deleteGalleryItem = createAsyncThunk(
  "gallery/deleteGalleryItem",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/gallery/${id}`, null, thunkAPI.rejectWithValue)
);

// --- SLICE ---
const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    clearGalleryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: GalleryState) => {
      state.loading = true;
      state.error = null;
    };
    const errorReducer = (state: GalleryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error =
        action.payload?.message ||
        action.payload ||
        "An unexpected error occurred.";
    };

    // --- PUBLIC GALLERY ---
    builder
      .addCase(fetchPublishedGalleryItems.pending, loadingReducer)
      .addCase(fetchPublishedGalleryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.publicImages = action.payload?.data || [];
      })
      .addCase(fetchPublishedGalleryItems.rejected, errorReducer);

    // --- ADMIN GALLERY ---
    builder
      .addCase(fetchGallery.pending, loadingReducer)
      .addCase(fetchGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.adminImages = action.payload?.data || [];
      })
      .addCase(fetchGallery.rejected, errorReducer);

    // ... Diğer işlemler aşağıda aynı şekilde devam eder ...
    builder
      .addCase(uploadGalleryItem.pending, loadingReducer)
      .addCase(uploadGalleryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "upload.success";
        state.adminImages.unshift(action.payload.data);
      })
      .addCase(uploadGalleryItem.rejected, errorReducer);

    builder
      .addCase(updateGalleryItem.pending, loadingReducer)
      .addCase(updateGalleryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "update.success";
        const updated = action.payload.data;
        const index = state.adminImages.findIndex(
          (item) => item._id === updated._id
        );
        if (index !== -1) {
          state.adminImages[index] = updated;
        }
      })
      .addCase(updateGalleryItem.rejected, errorReducer)
      .addCase(deleteGalleryItem.pending, loadingReducer)
      .addCase(deleteGalleryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "delete.success";
        const deletedId = action.meta.arg; // Thunk argümanı olarak gelen ID
        state.adminImages = state.adminImages.filter(
          (item) => item._id !== deletedId
        );
      })
      .addCase(deleteGalleryItem.rejected, errorReducer);

    // --- DİĞER ---
    builder
      .addCase(searchGalleryItems.pending, loadingReducer)
      .addCase(searchGalleryItems.fulfilled, (state, action) => {
        state.loading = false;
        // Sonucu adminImages'a veya yeni bir alana yazabilirsin. Örneğin:
        state.adminImages = action.payload.data;
      })
      .addCase(searchGalleryItems.rejected, errorReducer);

    builder
      .addCase(getGalleryStats.pending, loadingReducer)
      .addCase(getGalleryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data || {};
      })
      .addCase(getGalleryStats.rejected, errorReducer);

    builder
      .addCase(fetchPublishedGalleryCategories.pending, loadingReducer)
      .addCase(fetchPublishedGalleryCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchPublishedGalleryCategories.rejected, errorReducer);
  },
});

export const { clearGalleryMessages } = gallerySlice.actions;
export default gallerySlice.reducer;
