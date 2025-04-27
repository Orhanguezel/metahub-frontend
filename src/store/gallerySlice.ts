// src/store/gallerySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface GalleryItem {
  _id?: string;
  title: string;
  image: string;
  type: "image" | "video";
  createdAt?: string;
}

interface GalleryState {
  items: GalleryItem[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: GalleryState = {
  items: [],
  loading: false,
  error: null,
  successMessage: null,
};

// 📸 Get all gallery items
export const fetchGalleryItems = createAsyncThunk(
  "gallery/fetchGalleryItems",
  async (_, thunkAPI) =>
    await apiCall("get", "/gallery", null, thunkAPI.rejectWithValue)
);

// ⬆️ Upload new item (image/video)
export const uploadGalleryItem = createAsyncThunk(
  "gallery/uploadGalleryItem",
  async (formData: FormData, thunkAPI) =>
    await apiCall("post", "/gallery/upload", formData, thunkAPI.rejectWithValue, {
      "Content-Type": "multipart/form-data",
    })
);

// 🗑️ Delete item
export const deleteGalleryItem = createAsyncThunk(
  "gallery/deleteGalleryItem",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/gallery/${id}`, null, thunkAPI.rejectWithValue)
);

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
      state.error = action.payload;
    };

    builder
      .addCase(fetchGalleryItems.pending, loadingReducer)
      .addCase(fetchGalleryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGalleryItems.rejected, errorReducer);

    builder
      .addCase(uploadGalleryItem.pending, loadingReducer)
      .addCase(uploadGalleryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Medienelement wurde erfolgreich hochgeladen.";
        state.items.unshift(action.payload.item);
      })
      .addCase(uploadGalleryItem.rejected, errorReducer);

    builder
      .addCase(deleteGalleryItem.pending, loadingReducer)
      .addCase(deleteGalleryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Medienelement wurde gelöscht.";
        state.items = state.items.filter((item) => item._id !== action.meta.arg);
      })
      .addCase(deleteGalleryItem.rejected, errorReducer);
  },
});

export const { clearGalleryMessages } = gallerySlice.actions;
export default gallerySlice.reducer;
