import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ISparepart } from "../types";

interface SparepartState {
  sparepart: ISparepart[]; // Public (site) için
  sparepartAdmin: ISparepart[]; // Admin panel için
  selected: ISparepart | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: SparepartState = {
  sparepart: [],
  sparepartAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

// 🌍 Public - Get All
export const fetchSparepart = createAsyncThunk(
  "sparepart/fetchPublic",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/sparepart`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🌍 Public - Get By Slug
export const fetchSparepartBySlug = createAsyncThunk(
  "sparepart/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/sparepart/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🌍 Public - Get By ID
export const fetchSparepartByIdPublic = createAsyncThunk(
  "sparepart/fetchByIdPublic",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/sparepart/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🛠 Admin - Get All
export const fetchSparepartAdmin = createAsyncThunk(
  "sparepart/fetchAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/sparepart/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🛠 Admin - Get By ID
export const fetchSparepartByIdAdmin = createAsyncThunk(
  "sparepart/fetchByIdAdmin",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/sparepart/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ➕ Create (Admin)
export const createSparepart = createAsyncThunk(
  "sparepart/create",
  async (data: FormData | Record<string, any>, thunkAPI) => {
    const isFormData =
      typeof window !== "undefined" && data instanceof FormData;
    const res = await apiCall(
      "post",
      "/sparepart/admin",
      data,
      thunkAPI.rejectWithValue,
      isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined
    );
    return res.data;
  }
);

// ✏️ Update (Admin)
export const updateSparepart = createAsyncThunk(
  "sparepart/update",
  async (
    params: { id: string; data: FormData | Record<string, any> },
    thunkAPI
  ) => {
    const { id, data } = params;
    const isFormData =
      typeof window !== "undefined" && data instanceof FormData;
    const res = await apiCall(
      "put",
      `/sparepart/admin/${id}`,
      data,
      thunkAPI.rejectWithValue,
      isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined
    );
    return res.data;
  }
);

// ❌ Delete (Admin)
export const deleteSparepart = createAsyncThunk(
  "sparepart/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/sparepart/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

// 🔁 Toggle Publish (Admin)
export const togglePublishSparepart = createAsyncThunk(
  "sparepart/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/sparepart/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  }
);

const sparepartSlice = createSlice({
  name: "sparepart",
  initialState,
  reducers: {
    clearSparepartMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedSparepart: (state) => {
      state.selected = null;
    },
    setSelectedSparepart: (state, action: PayloadAction<ISparepart | null>) => {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: SparepartState) => {
      state.loading = true;
      state.error = null;
    };
    const failed = (state: SparepartState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred.";
    };

    // 🌍 PUBLIC reducers (sparepart)
    builder
      .addCase(fetchSparepart.pending, loading)
      .addCase(fetchSparepart.fulfilled, (state, action) => {
        state.loading = false;
        state.sparepart = action.payload;
      })
      .addCase(fetchSparepart.rejected, failed)

      .addCase(fetchSparepartBySlug.pending, loading)
      .addCase(fetchSparepartBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchSparepartBySlug.rejected, failed)

      .addCase(fetchSparepartByIdPublic.pending, loading)
      .addCase(fetchSparepartByIdPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchSparepartByIdPublic.rejected, failed);

    // 🛠 ADMIN reducers (sparepartAdmin)
    builder
      .addCase(fetchSparepartAdmin.pending, loading)
      .addCase(fetchSparepartAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.sparepartAdmin = action.payload;
      })
      .addCase(fetchSparepartAdmin.rejected, failed)

      .addCase(fetchSparepartByIdAdmin.pending, loading)
      .addCase(fetchSparepartByIdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchSparepartByIdAdmin.rejected, failed)

      // ➕ Create
      .addCase(createSparepart.pending, loading)
      .addCase(createSparepart.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Ürün başarıyla oluşturuldu.";
        if (action.payload?._id) {
          state.sparepartAdmin.unshift(action.payload);
        }
      })
      .addCase(createSparepart.rejected, failed)

      // ✏️ Update
      .addCase(updateSparepart.pending, loading)
      .addCase(updateSparepart.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Ürün başarıyla güncellendi.";
        const updated = action.payload;
        const index = state.sparepartAdmin.findIndex(
          (b) => b._id === updated._id
        );
        if (index !== -1) state.sparepartAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
      })
      .addCase(updateSparepart.rejected, failed)

      // ❌ Delete
      .addCase(deleteSparepart.pending, loading)
      .addCase(deleteSparepart.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Ürün başarıyla silindi.";
        state.sparepartAdmin = state.sparepartAdmin.filter(
          (b) => b._id !== action.payload.id
        );
      })
      .addCase(deleteSparepart.rejected, failed)

      // 🔁 Toggle Publish
      .addCase(togglePublishSparepart.pending, loading)
      .addCase(togglePublishSparepart.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.sparepartAdmin.findIndex(
          (b) => b._id === updated._id
        );
        if (index !== -1) state.sparepartAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = updated.isPublished
          ? "Ürün yayına alındı."
          : "Ürün yayından kaldırıldı.";
      })
      .addCase(togglePublishSparepart.rejected, failed);
  },
});

export const {
  clearSparepartMessages,
  clearSelectedSparepart,
  setSelectedSparepart,
} = sparepartSlice.actions;
export default sparepartSlice.reducer;
