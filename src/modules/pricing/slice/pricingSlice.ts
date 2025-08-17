import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IPricing } from "@/modules/pricing/types";

interface PricingState {
  pricing: IPricing[];
  pricingAdmin: IPricing[];
  selected: IPricing | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: PricingState = {
  pricing: [],
  pricingAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const BASE = "/pricing";

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

// PUBLIC: Tüm yayınlanan paketler
export const fetchPricing = createAsyncThunk<IPricing[]>(
  "pricing/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `${BASE}`, null, thunkAPI.rejectWithValue);
    // API: { success, message, data }
    return res.data as IPricing[];
  }
);

// ADMIN: Tüm paketler (admin)
export const fetchAllPricingAdmin = createAsyncThunk<IPricing[]>(
  "pricing/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `${BASE}/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data as IPricing[];
  }
);

// ADMIN: Tekil paket detay
export const fetchPricingByIdAdmin = createAsyncThunk<IPricing, string>(
  "pricing/fetchByIdAdmin",
  async (id, thunkAPI) => {
    const res = await apiCall(
      "get",
      `${BASE}/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data as IPricing;
  }
);

// ADMIN: Yeni paket oluştur
export const createPricing = createAsyncThunk(
  "pricing/create",
  async (payload: Partial<IPricing>, thunkAPI) => {
    const res = await apiCall(
      "post",
      `${BASE}/admin`,
      payload,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data as IPricing };
  }
);

// ADMIN: Paket güncelle
export const updatePricing = createAsyncThunk(
  "pricing/update",
  async ({ id, payload }: { id: string; payload: Partial<IPricing> }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `${BASE}/admin/${id}`,
      payload,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data as IPricing };
  }
);

// ADMIN: Paket sil
export const deletePricing = createAsyncThunk(
  "pricing/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `${BASE}/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

// --- Slice ---
const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {
    clearPricingMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedPricing: (state, action: PayloadAction<IPricing | null>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: PricingState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };

    const setError = (state: PricingState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public
    builder
      .addCase(fetchPricing.pending, setLoading)
      .addCase(fetchPricing.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.pricing = action.payload;
      })
      .addCase(fetchPricing.rejected, setError);

    // 🔐 Admin List
    builder
      .addCase(fetchAllPricingAdmin.pending, setLoading)
      .addCase(fetchAllPricingAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.pricingAdmin = action.payload;
      })
      .addCase(fetchAllPricingAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createPricing.pending, setLoading)
      .addCase(createPricing.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.pricingAdmin.unshift(action.payload.data);
        state.successMessage = action.payload.message;
      })
      .addCase(createPricing.rejected, setError);

    // 📝 Update
    builder
      .addCase(updatePricing.pending, setLoading)
      .addCase(updatePricing.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.pricingAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.pricingAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message;
      })
      .addCase(updatePricing.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deletePricing.pending, setLoading)
      .addCase(deletePricing.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.pricingAdmin = state.pricingAdmin.filter((a) => a._id !== action.payload.id);
        state.successMessage = action.payload.message;
      })
      .addCase(deletePricing.rejected, setError);
  },
});

export const { clearPricingMessages, setSelectedPricing } = pricingSlice.actions;
export default pricingSlice.reducer;
