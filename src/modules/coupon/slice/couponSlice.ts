import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Coupon } from "../types";

// State tipi
interface CouponState {
  coupons: Coupon[];         // Public (kullanıcıya açık)
  couponsAdmin: Coupon[];    // Admin (panelde tüm kuponlar)
  current: Coupon | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CouponState = {
  coupons: [],
  couponsAdmin: [],
  current: null,
  loading: false,
  error: null,
  successMessage: null,
};

// --- PUBLIC --- //
// 📥 Tüm geçerli kuponları getir (public)
export const fetchCoupons = createAsyncThunk(
  "coupon/fetchCoupons",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/coupon", null, thunkAPI.rejectWithValue);
    return res.data; // Coupon[]
  }
);

// 🔎 Kupon kodu kontrol et (public/checkout)
export const checkCouponByCode = createAsyncThunk(
  "coupon/checkCouponByCode",
  async (code: string, thunkAPI) => {
    const res = await apiCall("get", `/coupon/check/${code}`, null, thunkAPI.rejectWithValue);
    return res.data; // Coupon
  }
);

// --- ADMIN --- //
// 🛠️ Tüm kuponları getir (admin)
export const fetchCouponsAdmin = createAsyncThunk(
  "coupon/fetchCouponsAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/coupon/admin", null, thunkAPI.rejectWithValue);
    return res.data; // Coupon[]
  }
);

// ➕ Yeni kupon oluştur (admin)
export const createCouponAdmin = createAsyncThunk(
  "coupon/createCouponAdmin",
  async (data: Omit<Coupon, "_id" | "createdAt" | "updatedAt">, thunkAPI) => {
    const res = await apiCall("post", "/coupon/admin", data, thunkAPI.rejectWithValue);
    return res.data; // Coupon
  }
);

// ✏️ Kupon güncelle (admin)
export const updateCouponAdmin = createAsyncThunk(
  "coupon/updateCouponAdmin",
  async ({ id, data }: { id: string; data: Partial<Coupon> }, thunkAPI) => {
    const res = await apiCall("put", `/coupon/admin/${id}`, data, thunkAPI.rejectWithValue);
    return res.data; // Coupon
  }
);

// 🗑 Kupon sil (admin)
export const deleteCouponAdmin = createAsyncThunk(
  "coupon/deleteCouponAdmin",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/coupon/admin/${id}`, null, thunkAPI.rejectWithValue);
    return id; // sadece ID
  }
);

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    clearCouponMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearCurrentCoupon: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: CouponState) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    };
    const failed = (state: CouponState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred.";
    };

    // --- Public: geçerli kuponlar ---
    builder
      .addCase(fetchCoupons.pending, loading)
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload; // Coupon[]
      })
      .addCase(fetchCoupons.rejected, failed);

    // --- Public: kupon kodu kontrolü ---
    builder
      .addCase(checkCouponByCode.pending, loading)
      .addCase(checkCouponByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload; // Coupon
        state.successMessage = "Coupon valid!";
      })
      .addCase(checkCouponByCode.rejected, failed);

    // --- Admin: tüm kuponlar ---
    builder
      .addCase(fetchCouponsAdmin.pending, loading)
      .addCase(fetchCouponsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.couponsAdmin = action.payload; // Coupon[]
      })
      .addCase(fetchCouponsAdmin.rejected, failed);

    // --- Admin: kupon oluştur ---
    builder
      .addCase(createCouponAdmin.pending, loading)
      .addCase(createCouponAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Coupon created successfully.";
        state.couponsAdmin.unshift(action.payload);
      })
      .addCase(createCouponAdmin.rejected, failed);

    // --- Admin: kupon güncelle ---
    builder
      .addCase(updateCouponAdmin.pending, loading)
      .addCase(updateCouponAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Coupon updated successfully.";
        const updated = action.payload;
        state.couponsAdmin = state.couponsAdmin.map((c) =>
          c._id === updated._id ? updated : c
        );
        if (state.current && state.current._id === updated._id) state.current = updated;
      })
      .addCase(updateCouponAdmin.rejected, failed);

    // --- Admin: kupon sil ---
    builder
      .addCase(deleteCouponAdmin.pending, loading)
      .addCase(deleteCouponAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Coupon deleted successfully.";
        const deletedId = action.payload;
        state.couponsAdmin = state.couponsAdmin.filter((c) => c._id !== deletedId);
        if (state.current && state.current._id === deletedId) state.current = null;
      })
      .addCase(deleteCouponAdmin.rejected, failed);
  },
});

export const { clearCouponMessages, clearCurrentCoupon } = couponSlice.actions;
export default couponSlice.reducer;
