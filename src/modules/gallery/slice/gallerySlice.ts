// src/modules/gallery/slice/gallerySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IGallery } from "../types";

interface GalleryState {
  gallery: IGallery[];
  galleryAdmin: IGallery[];
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

const BASE_PUBLIC = "/gallery";
const BASE_ADMIN  = "/gallery/admin";

// ---- helpers ----
type Rej = { status?: number | string; message: string; data?: any };

const norm = <T = any>(res: any): { data: T; message?: string } => ({
  data: (res?.data ?? res) as T,
  message: res?.message,
});

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
export const fetchGallery = createAsyncThunk<
  IGallery[],
  void,
  { rejectValue: Rej }
>("gallery/fetchPublished", async (_, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", `${BASE_PUBLIC}/published`);
    return norm<IGallery[]>(res).data;
  } catch (err: any) {
    return rejectWithValue({
      status: err?.status ?? err?.response?.status,
      message: err?.message ?? err?.response?.data?.message ?? "Fetch failed",
      data: err?.response?.data,
    });
  }
});

// 🔐 Admin: all items (empty DB -> 200 + [])
export const fetchAllGalleryAdmin = createAsyncThunk<
  IGallery[],
  void,
  { rejectValue: Rej }
>("gallery/fetchAllAdmin", async (_, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", `${BASE_ADMIN}`);
    return norm<IGallery[]>(res).data;
  } catch (err: any) {
    return rejectWithValue({
      status: err?.status ?? err?.response?.status,
      message: err?.message ?? err?.response?.data?.message ?? "Fetch failed",
      data: err?.response?.data,
    });
  }
});

// ➕ Create (admin)
export const createGallery = createAsyncThunk<
  { data: IGallery; message?: string },
  FormData,
  { rejectValue: Rej }
>("gallery/create", async (formData, { rejectWithValue }) => {
  try {
    const res = await apiCall("post", `${BASE_ADMIN}/upload`, formData);
    return norm<IGallery>(res);
  } catch (err: any) {
    return rejectWithValue({
      status: err?.status ?? err?.response?.status,
      message: err?.message ?? err?.response?.data?.message ?? "Create failed",
      data: err?.response?.data,
    });
  }
});

// 📝 Update (admin)
export const updateGallery = createAsyncThunk<
  { data: IGallery; message?: string },
  { id: string; formData: FormData },
  { rejectValue: Rej }
>("gallery/update", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await apiCall("put", `${BASE_ADMIN}/${id}`, formData);
    return norm<IGallery>(res);
  } catch (err: any) {
    return rejectWithValue({
      status: err?.status ?? err?.response?.status,
      message: err?.message ?? err?.response?.data?.message ?? "Update failed",
      data: err?.response?.data,
    });
  }
});

// 🗑️ Delete (admin)
export const deleteGallery = createAsyncThunk<
  { id: string; message?: string },
  string,
  { rejectValue: Rej }
>("gallery/delete", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("delete", `${BASE_ADMIN}/${id}`);
    return { id, message: norm(res).message || "Deleted." };
  } catch (err: any) {
    return rejectWithValue({
      status: err?.status ?? err?.response?.status,
      message: err?.message ?? err?.response?.data?.message ?? "Delete failed",
      data: err?.response?.data,
    });
  }
});

// 🌍 Toggle publish (admin)
export const togglePublishGallery = createAsyncThunk<
  { data: IGallery; message?: string },
  { id: string },
  { rejectValue: Rej }
>("gallery/togglePublish", async ({ id }, { rejectWithValue }) => {
  try {
    const res = await apiCall("patch", `${BASE_ADMIN}/${id}/toggle`);
    return norm<IGallery>(res);
  } catch (err: any) {
    return rejectWithValue({
      status: err?.status ?? err?.response?.status,
      message: err?.message ?? err?.response?.data?.message ?? "Toggle failed",
      data: err?.response?.data,
    });
  }
});

// 🔎 Get by id (PUBLIC) – yalnızca aktif & yayınlanmış döner
export const fetchGalleryByIdPublic = createAsyncThunk<
  IGallery,
  string,
  { rejectValue: Rej }
>("gallery/fetchByIdPublic", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", `${BASE_PUBLIC}/${id}`);
    return norm<IGallery>(res).data;
  } catch (err: any) {
    return rejectWithValue({
      status: err?.status ?? err?.response?.status,
      message: err?.message ?? err?.response?.data?.message ?? "Fetch failed",
      data: err?.response?.data,
    });
  }
});

// 🔎 Get by id (ADMIN) – taslak/archived dahil
export const fetchGalleryByIdAdmin = createAsyncThunk<
  IGallery,
  string,
  { rejectValue: Rej }
>("gallery/fetchByIdAdmin", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", `${BASE_ADMIN}/${id}`);
    return norm<IGallery>(res).data;
  } catch (err: any) {
    return rejectWithValue({
      status: err?.status ?? err?.response?.status,
      message: err?.message ?? err?.response?.data?.message ?? "Fetch failed",
      data: err?.response?.data,
    });
  }
});

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
        state.galleryAdmin.unshift(action.payload.data);
        state.successMessage = action.payload.message || "Gallery item created.";
      })
      .addCase(createGallery.rejected, setError);

    // 📝 Update
    builder
      .addCase(updateGallery.pending, setLoading)
      .addCase(updateGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.galleryAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.galleryAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message || "Gallery item updated.";
      })
      .addCase(updateGallery.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deleteGallery.pending, setLoading)
      .addCase(deleteGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const deletedId = action.payload.id;
        state.galleryAdmin = state.galleryAdmin.filter((a) => a._id !== deletedId);
        if (state.selected?._id === deletedId) state.selected = null;
        state.successMessage = action.payload.message || "Gallery item deleted.";
      })
      .addCase(deleteGallery.rejected, setError);

    // 🌍 Toggle publish
    builder
      .addCase(togglePublishGallery.pending, setLoading)
      .addCase(togglePublishGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.galleryAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.galleryAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message || (updated.isPublished ? "Published." : "Unpublished.");
      })
      .addCase(togglePublishGallery.rejected, setError);

    // 🔎 Get by id (public)
    builder
      .addCase(fetchGalleryByIdPublic.pending, setLoading)
      .addCase(fetchGalleryByIdPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchGalleryByIdPublic.rejected, setError);

    // 🔎 Get by id (admin)
    builder
      .addCase(fetchGalleryByIdAdmin.pending, setLoading)
      .addCase(fetchGalleryByIdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchGalleryByIdAdmin.rejected, setError);
  },
});

export const { clearGalleryMessages, setSelectedGallery } = gallerySlice.actions;
export default gallerySlice.reducer;
