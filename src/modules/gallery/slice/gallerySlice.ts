import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { GalleryItem, GalleryCategory } from "@/modules/gallery/types/gallery";

interface GalleryState {
  items: GalleryItem[];
  categories: GalleryCategory[];
  stats: any;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: GalleryState = {
  items: [],
  stats: null,
  categories: [],
  loading: false,
  error: null,
  successMessage: null,
};

// ✅ Async thunks
export const fetchGalleryItems = createAsyncThunk(
  "gallery/fetchGalleryItems",
  async (params: any, thunkAPI) =>
    await apiCall("get", "/gallery", params, thunkAPI.rejectWithValue)
);

export const fetchPublishedGalleryItems = createAsyncThunk(
  "gallery/fetchPublishedGalleryItems",
  async (params: any, thunkAPI) =>
    await apiCall("get", "/gallery/published", params, thunkAPI.rejectWithValue)
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

export const deleteGalleryItem = createAsyncThunk(
  "gallery/deleteGalleryItem",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/gallery/${id}`, null, thunkAPI.rejectWithValue)
);

export const togglePublishGalleryItem = createAsyncThunk(
  "gallery/togglePublishGalleryItem",
  async (id: string, thunkAPI) =>
    await apiCall(
      "patch",
      `/gallery/${id}/toggle`,
      null,
      thunkAPI.rejectWithValue
    )
);

export const softDeleteGalleryItem = createAsyncThunk(
  "gallery/softDeleteGalleryItem",
  async (id: string, thunkAPI) =>
    await apiCall(
      "patch",
      `/gallery/${id}/archive`,
      null,
      thunkAPI.rejectWithValue
    )
);

export const restoreGalleryItem = createAsyncThunk(
  "gallery/restoreGalleryItem",
  async (id: string, thunkAPI) =>
    await apiCall(
      "patch",
      `/gallery/${id}/restore`,
      null,
      thunkAPI.rejectWithValue
    )
);

export const batchPublishGalleryItems = createAsyncThunk(
  "gallery/batchPublishGalleryItems",
  async (ids: string[], thunkAPI) =>
    await apiCall(
      "patch",
      `/gallery/batch/publish`,
      ids,
      thunkAPI.rejectWithValue
    )
);

export const batchDeleteGalleryItems = createAsyncThunk(
  "gallery/batchDeleteGalleryItems",
  async (ids: string[], thunkAPI) =>
    await apiCall("delete", `/gallery/batch`, ids, thunkAPI.rejectWithValue)
);

export const searchGalleryItems = createAsyncThunk(
  "gallery/searchGalleryItems",
  async (params: any, thunkAPI) =>
    await apiCall("get", `/gallery/search`, params, thunkAPI.rejectWithValue)
);

export const getGalleryStats = createAsyncThunk(
  "gallery/getGalleryStats",
  async (_, thunkAPI) =>
    await apiCall("get", `/gallery/stats`, null, thunkAPI.rejectWithValue)
);

export const fetchPublishedGalleryCategories = createAsyncThunk(
  "gallery/fetchPublishedGalleryCategories",
  async (_, thunkAPI) =>
    await apiCall("get", "/gallery/categories", null, thunkAPI.rejectWithValue)
);

// ✅ Slice
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

    builder
      .addCase(fetchGalleryItems.pending, loadingReducer)
      .addCase(fetchGalleryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchGalleryItems.rejected, errorReducer);

    builder
      .addCase(fetchPublishedGalleryItems.pending, loadingReducer)
      .addCase(fetchPublishedGalleryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchPublishedGalleryItems.rejected, errorReducer);

    builder
      .addCase(uploadGalleryItem.pending, loadingReducer)
      .addCase(uploadGalleryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "upload.success";
        state.items.unshift(action.payload.data);
      })
      .addCase(uploadGalleryItem.rejected, errorReducer);

    builder
      .addCase(updateGalleryItem.pending, loadingReducer)
      .addCase(updateGalleryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "update.success";
        const updated = action.payload.data;
        const index = state.items.findIndex((item) => item._id === updated._id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      })
      .addCase(updateGalleryItem.rejected, errorReducer);

    builder
      .addCase(deleteGalleryItem.pending, loadingReducer)
      .addCase(deleteGalleryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "delete.success";
        state.items = state.items.filter(
          (item) => item._id !== action.meta.arg
        );
      })
      .addCase(deleteGalleryItem.rejected, errorReducer);

    builder
      .addCase(togglePublishGalleryItem.pending, loadingReducer)
      .addCase(togglePublishGalleryItem.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "toggle.success";
      })
      .addCase(togglePublishGalleryItem.rejected, errorReducer);

    builder
      .addCase(softDeleteGalleryItem.pending, loadingReducer)
      .addCase(softDeleteGalleryItem.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "archive.success";
      })
      .addCase(softDeleteGalleryItem.rejected, errorReducer);

    builder
      .addCase(restoreGalleryItem.pending, loadingReducer)
      .addCase(restoreGalleryItem.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "restore.success";
      })
      .addCase(restoreGalleryItem.rejected, errorReducer);

    builder
      .addCase(batchPublishGalleryItems.pending, loadingReducer)
      .addCase(batchPublishGalleryItems.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "batch.publish.success";
      })
      .addCase(batchPublishGalleryItems.rejected, errorReducer);

    builder
      .addCase(batchDeleteGalleryItems.pending, loadingReducer)
      .addCase(batchDeleteGalleryItems.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "batch.delete.success";
      })
      .addCase(batchDeleteGalleryItems.rejected, errorReducer);

    builder
      .addCase(searchGalleryItems.pending, loadingReducer)
      .addCase(searchGalleryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(searchGalleryItems.rejected, errorReducer);

    builder
      .addCase(getGalleryStats.pending, loadingReducer)
      .addCase(getGalleryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(getGalleryStats.rejected, errorReducer);

    builder
      .addCase(fetchPublishedGalleryCategories.pending, loadingReducer)
      .addCase(fetchPublishedGalleryCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
      })
      .addCase(fetchPublishedGalleryCategories.rejected, errorReducer);
  },
});

export const { clearGalleryMessages } = gallerySlice.actions;
export default gallerySlice.reducer;
