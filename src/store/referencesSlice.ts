// src/store/referencesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IReference } from "@/types/reference";

interface ReferenceState {
  references: IReference[];
  selectedReference: IReference | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ReferenceState = {
  references: [],
  selectedReference: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 🔄 Get All
export const fetchReferences = createAsyncThunk(
  "references/fetchAll",
  async (_, thunkAPI) => await apiCall("get", "/references", null, thunkAPI.rejectWithValue)
);

// 🔍 Get By ID
export const fetchReferenceById = createAsyncThunk(
  "references/fetchById",
  async (id: string, thunkAPI) => await apiCall("get", `/references/${id}`, null, thunkAPI.rejectWithValue)
);

// 🔍 Get By Slug
export const fetchReferenceBySlug = createAsyncThunk(
  "references/fetchBySlug",
  async (slug: string, thunkAPI) =>
    await apiCall("get", `/references/slug/${slug}`, null, thunkAPI.rejectWithValue)
);

// ➕ Create
export const createReference = createAsyncThunk(
  "references/create",
  async (formData: FormData, thunkAPI) =>
    await apiCall("post", "/references", formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    })
);

// ✏️ Update
export const updateReference = createAsyncThunk(
  "references/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) =>
    await apiCall("put", `/references/${id}`, formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    })
);

// ❌ Delete
export const deleteReference = createAsyncThunk(
  "references/delete",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/references/${id}`, null, thunkAPI.rejectWithValue)
);

const referencesSlice = createSlice({
  name: "references",
  initialState,
  reducers: {
    clearReferenceMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: ReferenceState) => {
      state.loading = true;
      state.error = null;
    };

    const failed = (state: ReferenceState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "Beklenmeyen hata";
    };

    builder
      .addCase(fetchReferences.pending, loading)
      .addCase(fetchReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.references = action.payload;
      })
      .addCase(fetchReferences.rejected, failed)

      .addCase(fetchReferenceById.pending, loading)
      .addCase(fetchReferenceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReference = action.payload;
      })
      .addCase(fetchReferenceById.rejected, failed)

      .addCase(fetchReferenceBySlug.pending, loading)
      .addCase(fetchReferenceBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReference = action.payload;
      })
      .addCase(fetchReferenceBySlug.rejected, failed)

      .addCase(createReference.pending, loading)
      .addCase(createReference.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Referans eklendi";
        state.references.unshift(action.payload.reference);
      })
      .addCase(createReference.rejected, failed)

      .addCase(updateReference.pending, loading)
      .addCase(updateReference.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Referans güncellendi";
        const updated = action.payload.reference;
        const index = state.references.findIndex((r) => r._id === updated._id);
        if (index !== -1) state.references[index] = updated;
      })
      .addCase(updateReference.rejected, failed)

      .addCase(deleteReference.pending, loading)
      .addCase(deleteReference.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Referans silindi";
        state.references = state.references.filter(
          (ref) => ref._id !== action.payload?.reference?._id
        );
      })
      .addCase(deleteReference.rejected, failed);
  },
});

export const { clearReferenceMessages } = referencesSlice.actions;
export default referencesSlice.reducer;
