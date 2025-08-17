// src/modules/gallery/slice/gallerySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IGallery } from "../types";

interface GalleryState {
  gallery: IGallery[];       // public
  galleryAdmin: IGallery[];  // admin
  selected: IGallery | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: GalleryState = {
  gallery: [],
  galleryAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const BASE = "/gallery";

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const m = (payload as any).message;
    if (typeof m === "string") return m;
  }
  return "An error occurred.";
};

/* ====================== THUNKS ====================== */

// 🌐 Public: published list
export const fetchGallery = createAsyncThunk<IGallery[]>(
  "gallery/fetchPublished",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `${BASE}/published`, null, thunkAPI.rejectWithValue);
    // backend -> direkt dizi
    return res as IGallery[];
  }
);

// 🔐 Admin: all items
export const fetchAllGalleryAdmin = createAsyncThunk<IGallery[]>(
  "gallery/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `${BASE}`, null, thunkAPI.rejectWithValue);
    return res as IGallery[];
  }
);

// ➕ Create (FormData)
export const createGallery = createAsyncThunk<IGallery, FormData>(
  "gallery/create",
  async (formData, thunkAPI) => {
    const res = await apiCall("post", `${BASE}/upload`, formData, thunkAPI.rejectWithValue);
    return res as IGallery;
  }
);

// 📝 Update (FormData)
export const updateGallery = createAsyncThunk<IGallery, { id: string; formData: FormData }>(
  "gallery/update",
  async ({ id, formData }, thunkAPI) => {
    const res = await apiCall("put", `${BASE}/${id}`, formData, thunkAPI.rejectWithValue);
    return res as IGallery;
  }
);

// 🗑️ Delete
export const deleteGallery = createAsyncThunk<string, string>(
  "gallery/delete",
  async (id, thunkAPI) => {
    await apiCall("delete", `${BASE}/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

// 🌍 Toggle publish
export const togglePublishGallery = createAsyncThunk<IGallery, { id: string }>(
  "gallery/togglePublish",
  async ({ id }, thunkAPI) => {
    const res = await apiCall("patch", `${BASE}/${id}/toggle`, null, thunkAPI.rejectWithValue);
    return res as IGallery;
  }
);

// 🔎 Get by id (public/admin)
export const fetchGalleryById = createAsyncThunk<IGallery, string>(
  "gallery/fetchById",
  async (id, thunkAPI) => {
    const res = await apiCall("get", `${BASE}/${id}`, null, thunkAPI.rejectWithValue);
    return res as IGallery;
  }
);

/* ====================== SLICE ====================== */

const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    clearGalleryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedGallery: (state, action: PayloadAction<IGallery | null>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: GalleryState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
      state.successMessage = null;
    };
    const setError = (state: GalleryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public list
    builder
      .addCase(fetchGallery.pending, setLoading)
      .addCase(fetchGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.gallery = action.payload;
      })
      .addCase(fetchGallery.rejected, setError);

    // 🔐 Admin list
    builder
      .addCase(fetchAllGalleryAdmin.pending, setLoading)
      .addCase(fetchAllGalleryAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.galleryAdmin = action.payload;
      })
      .addCase(fetchAllGalleryAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createGallery.pending, setLoading)
      .addCase(createGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.galleryAdmin.unshift(action.payload);
        state.successMessage = "Gallery item created.";
      })
      .addCase(createGallery.rejected, setError);

    // 📝 Update
    builder
      .addCase(updateGallery.pending, setLoading)
      .addCase(updateGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.galleryAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.galleryAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = "Gallery item updated.";
      })
      .addCase(updateGallery.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deleteGallery.pending, setLoading)
      .addCase(deleteGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const deletedId = action.payload;
        state.galleryAdmin = state.galleryAdmin.filter((a) => a._id !== deletedId);
        if (state.selected?._id === deletedId) state.selected = null;
        state.successMessage = "Gallery item deleted.";
      })
      .addCase(deleteGallery.rejected, setError);

    // 🌍 Toggle publish
    builder
      .addCase(togglePublishGallery.pending, setLoading)
      .addCase(togglePublishGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.galleryAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.galleryAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = updated.isPublished ? "Published." : "Unpublished.";
      })
      .addCase(togglePublishGallery.rejected, setError);

    // 🔎 Get by id
    builder
      .addCase(fetchGalleryById.pending, setLoading)
      .addCase(fetchGalleryById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchGalleryById.rejected, setError);
  },
});

export const { clearGalleryMessages, setSelectedGallery } = gallerySlice.actions;
export default gallerySlice.reducer;
