import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IEnsotekprod } from "../types";

interface EnsotekprodState {
  ensotekprod: IEnsotekprod[];           // Public (site) için
  ensotekprodAdmin: IEnsotekprod[];      // Admin panel için
  selected: IEnsotekprod | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: EnsotekprodState = {
  ensotekprod: [],
  ensotekprodAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

// 🌍 Public - Get All
export const fetchEnsotekprod = createAsyncThunk(
  "ensotekprod/fetchPublic",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `/ensotekprod`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 🌍 Public - Get By Slug
export const fetchEnsotekprodBySlug = createAsyncThunk(
  "ensotekprod/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall("get", `/ensotekprod/slug/${slug}`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 🌍 Public - Get By ID
export const fetchEnsotekprodByIdPublic = createAsyncThunk(
  "ensotekprod/fetchByIdPublic",
  async (id: string, thunkAPI) => {
    const res = await apiCall("get", `/ensotekprod/${id}`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 🛠 Admin - Get All
export const fetchEnsotekprodAdmin = createAsyncThunk(
  "ensotekprod/fetchAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `/ensotekprod/admin`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 🛠 Admin - Get By ID
export const fetchEnsotekprodByIdAdmin = createAsyncThunk(
  "ensotekprod/fetchByIdAdmin",
  async (id: string, thunkAPI) => {
    const res = await apiCall("get", `/ensotekprod/admin/${id}`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// ➕ Create (Admin)
export const createEnsotekprod = createAsyncThunk(
  "ensotekprod/create",
  async (data: FormData | Record<string, any>, thunkAPI) => {
    const isFormData = typeof window !== "undefined" && data instanceof FormData;
    const res = await apiCall(
      "post",
      "/ensotekprod/admin",
      data,
      thunkAPI.rejectWithValue,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return res.data;
  }
);

// ✏️ Update (Admin)
export const updateEnsotekprod = createAsyncThunk(
  "ensotekprod/update",
  async (params: { id: string; data: FormData | Record<string, any> }, thunkAPI) => {
    const { id, data } = params;
    const isFormData = typeof window !== "undefined" && data instanceof FormData;
    const res = await apiCall(
      "put",
      `/ensotekprod/admin/${id}`,
      data,
      thunkAPI.rejectWithValue,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return res.data;
  }
);

// ❌ Delete (Admin)
export const deleteEnsotekprod = createAsyncThunk(
  "ensotekprod/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall("delete", `/ensotekprod/admin/${id}`, null, thunkAPI.rejectWithValue);
    return { id, message: res.message };
  }
);

// 🔁 Toggle Publish (Admin)
export const togglePublishEnsotekprod = createAsyncThunk(
  "ensotekprod/togglePublish",
  async ({ id, isPublished }: { id: string; isPublished: boolean }, thunkAPI) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/ensotekprod/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  }
);

const ensotekprodSlice = createSlice({
  name: "ensotekprod",
  initialState,
  reducers: {
    clearEnsotekprodMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedEnsotekprod: (state) => {
      state.selected = null;
    },
    setSelectedEnsotekprod: (state, action: PayloadAction<IEnsotekprod | null>) => {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: EnsotekprodState) => {
      state.loading = true;
      state.error = null;
    };
    const failed = (state: EnsotekprodState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred.";
    };

    // 🌍 PUBLIC reducers (ensotekprod)
    builder
      .addCase(fetchEnsotekprod.pending, loading)
      .addCase(fetchEnsotekprod.fulfilled, (state, action) => {
        state.loading = false;
        state.ensotekprod = action.payload;
      })
      .addCase(fetchEnsotekprod.rejected, failed)

      .addCase(fetchEnsotekprodBySlug.pending, loading)
      .addCase(fetchEnsotekprodBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchEnsotekprodBySlug.rejected, failed)

      .addCase(fetchEnsotekprodByIdPublic.pending, loading)
      .addCase(fetchEnsotekprodByIdPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchEnsotekprodByIdPublic.rejected, failed);

    // 🛠 ADMIN reducers (ensotekprodAdmin)
    builder
      .addCase(fetchEnsotekprodAdmin.pending, loading)
      .addCase(fetchEnsotekprodAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.ensotekprodAdmin = action.payload;
      })
      .addCase(fetchEnsotekprodAdmin.rejected, failed)

      .addCase(fetchEnsotekprodByIdAdmin.pending, loading)
      .addCase(fetchEnsotekprodByIdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchEnsotekprodByIdAdmin.rejected, failed)

      // ➕ Create
      .addCase(createEnsotekprod.pending, loading)
      .addCase(createEnsotekprod.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Ürün başarıyla oluşturuldu.";
        if (action.payload?._id) {
          state.ensotekprodAdmin.unshift(action.payload);
        }
      })
      .addCase(createEnsotekprod.rejected, failed)

      // ✏️ Update
      .addCase(updateEnsotekprod.pending, loading)
      .addCase(updateEnsotekprod.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Ürün başarıyla güncellendi.";
        const updated = action.payload;
        const index = state.ensotekprodAdmin.findIndex(
          (b) => b._id === updated._id
        );
        if (index !== -1) state.ensotekprodAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
      })
      .addCase(updateEnsotekprod.rejected, failed)

      // ❌ Delete
      .addCase(deleteEnsotekprod.pending, loading)
      .addCase(deleteEnsotekprod.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Ürün başarıyla silindi.";
        state.ensotekprodAdmin = state.ensotekprodAdmin.filter(
          (b) => b._id !== action.payload.id
        );
      })
      .addCase(deleteEnsotekprod.rejected, failed)

      // 🔁 Toggle Publish
      .addCase(togglePublishEnsotekprod.pending, loading)
      .addCase(togglePublishEnsotekprod.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.ensotekprodAdmin.findIndex(
          (b) => b._id === updated._id
        );
        if (index !== -1) state.ensotekprodAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = updated.isPublished
          ? "Ürün yayına alındı."
          : "Ürün yayından kaldırıldı.";
      })
      .addCase(togglePublishEnsotekprod.rejected, failed);
  },
});

export const {
  clearEnsotekprodMessages,
  clearSelectedEnsotekprod,
  setSelectedEnsotekprod,
} = ensotekprodSlice.actions;
export default ensotekprodSlice.reducer;
