import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IReferences } from "@/modules/references";

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface ReferencesState {
  references: IReferences[];
  referencesAdmin: IReferences[];
  selected: IReferences | null;
  status: StatusType;           // <-- EKLENDİ
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ReferencesState = {
  references: [],
  referencesAdmin: [],
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

export const fetchReferences = createAsyncThunk<IReferences[]>(
  "references/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/references`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const fetchAllReferencesAdmin = createAsyncThunk<IReferences[]>(
  "references/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/references/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const createReferences = createAsyncThunk(
  "references/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/references/admin",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const updateReferences = createAsyncThunk(
  "references/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/references/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const deleteReferences = createAsyncThunk(
  "references/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/references/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

export const togglePublishReferences = createAsyncThunk(
  "references/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/references/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const fetchReferencesBySlug = createAsyncThunk(
  "references/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/references/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---

const referencesSlice = createSlice({
  name: "references",
  initialState,
  reducers: {
    clearReferencesMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setSelectedReferences(state, action: PayloadAction<IReferences | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: ReferencesState) => {
      state.loading = true;
      state.status = "loading";    // <-- EKLENDİ
      state.error = null;
      state.successMessage = null;
    };

    const setError = (state: ReferencesState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";     // <-- EKLENDİ
      state.error = extractErrorMessage(action.payload);
      state.successMessage = null;
    };

    builder
      // Public List
      .addCase(fetchReferences.pending, startLoading)
      .addCase(fetchReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.references = action.payload;
      })
      .addCase(fetchReferences.rejected, setError)

      // Admin List
      .addCase(fetchAllReferencesAdmin.pending, startLoading)
      .addCase(fetchAllReferencesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.referencesAdmin = action.payload;
      })
      .addCase(fetchAllReferencesAdmin.rejected, setError)

      // Create
      .addCase(createReferences.pending, startLoading)
      .addCase(createReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        if (action.payload?.data) {
          state.referencesAdmin.unshift(action.payload.data);
          state.successMessage = action.payload?.message || null;
        }
      })
      .addCase(createReferences.rejected, setError)

      // Update
      .addCase(updateReferences.pending, startLoading)
      .addCase(updateReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload?.data || action.payload;
        const index = state.referencesAdmin.findIndex(
          (a) => a._id === updated._id
        );
        if (index !== -1) state.referencesAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message || null;
      })
      .addCase(updateReferences.rejected, setError)

      // Delete
      .addCase(deleteReferences.pending, startLoading)
      .addCase(deleteReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.referencesAdmin = state.referencesAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload?.message || null;
      })
      .addCase(deleteReferences.rejected, setError)

      // Toggle Publish
      .addCase(togglePublishReferences.pending, startLoading)
      .addCase(togglePublishReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload?.data || action.payload;
        const index = state.referencesAdmin.findIndex(
          (a) => a._id === updated._id
        );
        if (index !== -1) state.referencesAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message || null;
      })
      .addCase(togglePublishReferences.rejected, setError)

      // Single Fetch (slug)
      .addCase(fetchReferencesBySlug.pending, startLoading)
      .addCase(fetchReferencesBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchReferencesBySlug.rejected, setError);
  },
});

export const { clearReferencesMessages, setSelectedReferences } =
  referencesSlice.actions;
export default referencesSlice.reducer;
