import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ILibrary } from "@/modules/library";

interface LibraryState {
  library: ILibrary[]; // Public (site) için
  libraryAdmin: ILibrary[]; // Admin panel için
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

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof (payload as any).message === "string"
  )
    return (payload as any).message;
  return "An error occurred.";
};

// --- Async Thunks ---

export const fetchLibrary = createAsyncThunk<ILibrary[]>(
  "library/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/library`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const fetchAllLibraryAdmin = createAsyncThunk<ILibrary[]>(
  "library/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/library/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const createLibrary = createAsyncThunk(
  "library/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/library/admin",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const updateLibrary = createAsyncThunk(
  "library/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/library/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const deleteLibrary = createAsyncThunk(
  "library/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/library/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

export const togglePublishLibrary = createAsyncThunk(
  "library/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/library/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const fetchLibraryBySlug = createAsyncThunk(
  "library/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/library/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
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
    const startLoading = (state: LibraryState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: LibraryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = extractErrorMessage(action.payload);
    };

    // --- Public List ---
    builder
      .addCase(fetchLibrary.pending, startLoading)
      .addCase(fetchLibrary.fulfilled, (state, action) => {
        state.loading = false;
        state.library = action.payload;
      })
      .addCase(fetchLibrary.rejected, setError);

    // --- Admin List ---
    builder
      .addCase(fetchAllLibraryAdmin.pending, startLoading)
      .addCase(fetchAllLibraryAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.libraryAdmin = action.payload;
      })
      .addCase(fetchAllLibraryAdmin.rejected, setError);

    // --- Admin Create ---
    builder
      .addCase(createLibrary.pending, startLoading)
      .addCase(createLibrary.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        if (action.payload?.data) {
          state.libraryAdmin.unshift(action.payload.data);
        }
      })
      .addCase(createLibrary.rejected, setError);

    // --- Admin Update ---
    builder
      .addCase(updateLibrary.pending, startLoading)
      .addCase(updateLibrary.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.libraryAdmin.findIndex(
          (a) => a._id === updated._id
        );
        if (index !== -1) state.libraryAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(updateLibrary.rejected, setError);

    // --- Admin Delete ---
    builder
      .addCase(deleteLibrary.pending, startLoading)
      .addCase(deleteLibrary.fulfilled, (state, action) => {
        state.loading = false;
        state.libraryAdmin = state.libraryAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload?.message;
      })
      .addCase(deleteLibrary.rejected, setError);

    // --- Admin Toggle Publish ---
    builder
      .addCase(togglePublishLibrary.pending, startLoading)
      .addCase(togglePublishLibrary.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.libraryAdmin.findIndex(
          (a) => a._id === updated._id
        );
        if (index !== -1) state.libraryAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(togglePublishLibrary.rejected, setError);

    // --- Single Fetch (slug) ---
    builder
      .addCase(fetchLibraryBySlug.pending, startLoading)
      .addCase(fetchLibraryBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchLibraryBySlug.rejected, setError);
  },
});

export const { clearLibraryMessages, setSelectedLibrary } =
  librarySlice.actions;
export default librarySlice.reducer;
