import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IReferences } from "@/modules/references/types";

interface ReferencesState {
  references: IReferences[];
  selected: IReferences | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ReferencesState = {
  references: [],
  selected: null,
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
    return res.data; // backend: { success: true, message: "..." }
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

export const fetchAllReferencesAdmin = createAsyncThunk(
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
    },
    setSelectedReferences(state, action: PayloadAction<IReferences | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: ReferencesState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: ReferencesState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = extractErrorMessage(action.payload);
    };

    builder
      .addCase(fetchReferences.pending, startLoading)
      .addCase(fetchReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.references = action.payload;
      })
      .addCase(fetchReferences.rejected, setError)

      .addCase(fetchAllReferencesAdmin.pending, startLoading)
      .addCase(fetchAllReferencesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.references = action.payload;
      })
      .addCase(fetchAllReferencesAdmin.rejected, setError)

      .addCase(createReferences.pending, startLoading)
      .addCase(createReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Article created successfully.";
        if (action.payload?.data) {
          state.references.unshift(action.payload.data);
        }
      })
      .addCase(createReferences.rejected, setError)

      .addCase(updateReferences.pending, startLoading)
      .addCase(updateReferences.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.references.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.references[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(updateReferences.rejected, setError)

      .addCase(deleteReferences.pending, startLoading)
      .addCase(deleteReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.references = state.references.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload?.message;
      })
      .addCase(deleteReferences.rejected, setError)

      .addCase(togglePublishReferences.pending, startLoading)
      .addCase(togglePublishReferences.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.references.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.references[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(togglePublishReferences.rejected, setError)

      .addCase(fetchReferencesBySlug.pending, startLoading)
      .addCase(fetchReferencesBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchReferencesBySlug.rejected, setError);
  },
});

export const { clearReferencesMessages, setSelectedReferences } =
  referencesSlice.actions;
export default referencesSlice.reducer;
