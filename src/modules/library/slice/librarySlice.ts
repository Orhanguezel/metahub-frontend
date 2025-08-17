import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ILibrary } from "@/modules/library";

// --- State ---
interface LibraryState {
  library: ILibrary[];
  libraryAdmin: ILibrary[];
  selected: ILibrary | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}
const initialState: LibraryState = {
  library: [],
  libraryAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

// helpers
const pickData = (res: any) => res?.data?.data ?? res?.data ?? res;
const pickMessage = (res: any) => res?.data?.message ?? res?.message ?? null;
const extractErrorMessage = (payload: unknown): string =>
  typeof payload === "string"
    ? payload
    : (payload as any)?.message || "An error occurred.";

    const BASE = "/library"

// --- Thunks ---
export const fetchLibrary = createAsyncThunk<ILibrary[], void, { rejectValue: string }>(
  "library/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiCall("get", `${BASE}`, null, rejectWithValue);
      return pickData(res);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to fetch library.");
    }
  }
);

export const fetchAllLibraryAdmin = createAsyncThunk<ILibrary[], void, { rejectValue: string }>(
  "library/fetchAllAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiCall("get", `${BASE}/admin`, null, rejectWithValue);
      return pickData(res);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to fetch admin library.");
    }
  }
);

export const createLibrary = createAsyncThunk<any, FormData, { rejectValue: string }>(
  "library/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await apiCall("post", `${BASE}/admin`, formData, rejectWithValue);
      return res;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to create library item.");
    }
  }
);

export const updateLibrary = createAsyncThunk<any, { id: string; formData: FormData }, { rejectValue: string }>(
  "library/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await apiCall("put", `${BASE}/admin/${id}`, formData, rejectWithValue);
      return res;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to update library item.");
    }
  }
);

export const deleteLibrary = createAsyncThunk<{ id: string; message?: string }, string, { rejectValue: string }>(
  "library/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiCall("delete", `${BASE}/admin/${id}`, null, rejectWithValue);
      return { id, message: pickMessage(res) || "Deleted successfully." };
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to delete library item.");
    }
  }
);

export const togglePublishLibrary = createAsyncThunk<any, { id: string; isPublished: boolean }, { rejectValue: string }>(
  "library/togglePublish",
  async ({ id, isPublished }, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append("isPublished", String(isPublished));
      const res = await apiCall("put", `${BASE}/admin/${id}`, fd, rejectWithValue);
      return res;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to toggle publish.");
    }
  }
);

export const fetchLibraryBySlug = createAsyncThunk<ILibrary, string, { rejectValue: string }>(
  "library/fetchBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const res = await apiCall("get", `${BASE}/slug/${slug}`, null, rejectWithValue);
      return pickData(res);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to fetch item.");
    }
  }
);

// --- Slice ---
const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    clearLibraryMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedLibrary(state, action: PayloadAction<ILibrary | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const start = (s: LibraryState) => {
      s.loading = true;
      s.status = "loading";
      s.error = null;
      s.successMessage = null;
    };
    const fail = (s: LibraryState, a: PayloadAction<any>) => {
      s.loading = false;
      s.status = "failed";
      s.error = extractErrorMessage(a.payload);
    };

    // public list
    builder
      .addCase(fetchLibrary.pending, start)
      .addCase(fetchLibrary.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.library = a.payload;
      })
      .addCase(fetchLibrary.rejected, fail);

    // admin list
    builder
      .addCase(fetchAllLibraryAdmin.pending, start)
      .addCase(fetchAllLibraryAdmin.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.libraryAdmin = a.payload;
      })
      .addCase(fetchAllLibraryAdmin.rejected, fail);

    // create
    builder
      .addCase(createLibrary.pending, start)
      .addCase(createLibrary.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const item = pickData(a.payload);
        const msg = pickMessage(a.payload);
        if (item?._id) s.libraryAdmin.unshift(item);
        s.successMessage = msg || "Created.";
      })
      .addCase(createLibrary.rejected, fail);

    // update
    builder
      .addCase(updateLibrary.pending, start)
      .addCase(updateLibrary.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const updated = pickData(a.payload);
        const msg = pickMessage(a.payload);
        const i = s.libraryAdmin.findIndex((x) => x._id === updated?._id);
        if (i !== -1) s.libraryAdmin[i] = updated;
        if (s.selected?._id === updated?._id) s.selected = updated;
        s.successMessage = msg || "Updated.";
      })
      .addCase(updateLibrary.rejected, fail);

    // delete
    builder
      .addCase(deleteLibrary.pending, start)
      .addCase(deleteLibrary.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.libraryAdmin = s.libraryAdmin.filter((x) => x._id !== a.payload.id);
        s.successMessage = a.payload.message || "Deleted.";
      })
      .addCase(deleteLibrary.rejected, fail);

    // toggle publish
    builder
      .addCase(togglePublishLibrary.pending, start)
      .addCase(togglePublishLibrary.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const updated = pickData(a.payload);
        const msg = pickMessage(a.payload);
        const i = s.libraryAdmin.findIndex((x) => x._id === updated?._id);
        if (i !== -1) s.libraryAdmin[i] = updated;
        if (s.selected?._id === updated?._id) s.selected = updated;
        s.successMessage = msg || "Status updated.";
      })
      .addCase(togglePublishLibrary.rejected, fail);

    // single by slug
    builder
      .addCase(fetchLibraryBySlug.pending, start)
      .addCase(fetchLibraryBySlug.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.selected = a.payload;
      })
      .addCase(fetchLibraryBySlug.rejected, fail);
  },
});

export const { clearLibraryMessages, setSelectedLibrary } = librarySlice.actions;
export default librarySlice.reducer;
