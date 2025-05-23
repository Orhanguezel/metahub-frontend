// src/store/referencesSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IReference } from "@/modules/references/types/reference";

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

// --- PUBLIC ENDPOINTLER ---

export const fetchReferences = createAsyncThunk(
  "references/fetchAll",
  async (lang: "tr" | "en" | "de" | undefined, thunkAPI) => {
    const param = lang ? `?language=${lang}` : "";
    const res = await apiCall("get", `/references${param}`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);


// Slug ile getir (public)
export const fetchReferenceBySlug = createAsyncThunk(
  "references/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall("get", `/references/slug/${slug}`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ID ile getir (public)
export const fetchReferenceById = createAsyncThunk(
  "references/fetchById",
  async (id: string, thunkAPI) => {
    const res = await apiCall("get", `/references/${id}`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// --- ADMIN ENDPOINTLER ---

// Admin: tüm referansları çek (dil opsiyonu ile)
export const fetchReferencesAdmin = createAsyncThunk(
  "references/fetchAllAdmin",
  async (lang: "tr" | "en" | "de" | undefined, thunkAPI) => {
    const params = lang ? `?language=${lang}` : "";
    const res = await apiCall("get", `/references/admin${params}`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// Admin: ID ile getir
export const fetchReferenceByIdAdmin = createAsyncThunk(
  "references/fetchByIdAdmin",
  async (id: string, thunkAPI) => {
    const res = await apiCall("get", `/references/admin/${id}`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// Admin: Ekle
export const createReference = createAsyncThunk(
  "references/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/references/admin",
      formData,
      thunkAPI.rejectWithValue,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  }
);

// Admin: Güncelle
export const updateReference = createAsyncThunk(
  "references/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/references/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  }
);

// Admin: Sil
export const deleteReference = createAsyncThunk(
  "references/delete",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/references/admin/${id}`, null, thunkAPI.rejectWithValue);
    return { id };
  }
);



// Admin: Toggle Publish (isPublished)
export const togglePublishReference = createAsyncThunk(
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
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  }
);

const referencesSlice = createSlice({
  name: "references",
  initialState,
  reducers: {
    clearReferenceMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
    clearSelectedReference: (state) => {
      state.selectedReference = null;
    },
  },
  extraReducers: (builder) => {
    // Loading & Error helpers
    const loading = (state: ReferenceState) => {
      state.loading = true;
      state.error = null;
    };
    const failed = (state: ReferenceState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "Beklenmeyen hata";
    };

    // --- Public ---
    builder
      .addCase(fetchReferences.pending, loading)
      .addCase(fetchReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.references = action.payload || [];
      })
      .addCase(fetchReferences.rejected, failed)

      .addCase(fetchReferenceBySlug.pending, loading)
      .addCase(fetchReferenceBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReference = action.payload || null;
      })
      .addCase(fetchReferenceBySlug.rejected, failed)

      .addCase(fetchReferenceById.pending, loading)
      .addCase(fetchReferenceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReference = action.payload || null;
      })
      .addCase(fetchReferenceById.rejected, failed);

    // --- Admin ---
    builder
      .addCase(fetchReferencesAdmin.pending, loading)
      .addCase(fetchReferencesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.references = action.payload || [];
      })
      .addCase(fetchReferencesAdmin.rejected, failed)

      .addCase(fetchReferenceByIdAdmin.pending, loading)
      .addCase(fetchReferenceByIdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReference = action.payload || null;
      })
      .addCase(fetchReferenceByIdAdmin.rejected, failed)

      .addCase(createReference.pending, loading)
      .addCase(createReference.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Referans başarıyla eklendi.";
        if (action.payload?._id) {
          state.references.unshift(action.payload);
        }
      })
      .addCase(createReference.rejected, failed)

      .addCase(updateReference.pending, loading)
      .addCase(updateReference.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Referans güncellendi.";
        const updated = action.payload;
        const index = state.references.findIndex((r) => r._id === updated._id);
        if (index !== -1) state.references[index] = updated;
        if (state.selectedReference?._id === updated._id)
          state.selectedReference = updated;
      })
      .addCase(updateReference.rejected, failed)

      .addCase(deleteReference.pending, loading)
      .addCase(deleteReference.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Referans silindi.";
        state.references = state.references.filter(
          (ref) => ref._id !== action.payload.id
        );
      })
      .addCase(deleteReference.rejected, failed)

      .addCase(togglePublishReference.pending, loading)
      .addCase(togglePublishReference.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.references.findIndex((r) => r._id === updated._id);
        if (index !== -1) state.references[index] = updated;
        if (state.selectedReference?._id === updated._id)
          state.selectedReference = updated;
        state.successMessage = updated.isPublished
          ? "Referans yayınlandı."
          : "Yayından kaldırıldı.";
      })
      .addCase(togglePublishReference.rejected, failed);
  },
});

export const { clearReferenceMessages, clearSelectedReference } = referencesSlice.actions;
export default referencesSlice.reducer;
