import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Coupon } from "../types";

// State tipi
interface CouponState {
  coupons: Coupon[];
  current: Coupon | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CouponState = {
  coupons: [],
  current: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 🔎 Kupon kodu kontrol et (public/checkout)
export const checkCouponByCode = createAsyncThunk(
  "coupon/checkCouponByCode",
  async (code: string, thunkAPI) => {
    return await apiCall("get", `/coupon/check/${code}`, null, thunkAPI.rejectWithValue);
  }
);

// 📥 Tüm kuponları getir (admin)
export const fetchCoupons = createAsyncThunk(
  "coupon/fetchCoupons",
  async (_, thunkAPI) => {
    return await apiCall("get", "/coupon", null, thunkAPI.rejectWithValue);
  }
);

// ➕ Yeni kupon oluştur (admin)
export const createCoupon = createAsyncThunk(
  "coupon/createCoupon",
  async (data: Omit<Coupon, "_id" | "createdAt" | "updatedAt">, thunkAPI) => {
    return await apiCall("post", "/coupon", data, thunkAPI.rejectWithValue);
  }
);

// ✏️ Kupon güncelle (admin)
export const updateCoupon = createAsyncThunk(
  "coupon/updateCoupon",
  async ({ id, data }: { id: string; data: Partial<Coupon> }, thunkAPI) => {
    return await apiCall("put", `/coupon/${id}`, data, thunkAPI.rejectWithValue);
  }
);

// 🗑 Kupon sil (admin)
export const deleteCoupon = createAsyncThunk(
  "coupon/deleteCoupon",
  async (id: string, thunkAPI) => {
    return await apiCall("delete", `/coupon/${id}`, null, thunkAPI.rejectWithValue);
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

    // Kupon kodu kontrolü
    builder
      .addCase(checkCouponByCode.pending, loading)
      .addCase(checkCouponByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.data;
        state.successMessage = "Coupon valid!";
      })
      .addCase(checkCouponByCode.rejected, failed);

    // Tüm kuponlar
    builder
      .addCase(fetchCoupons.pending, loading)
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.data;
      })
      .addCase(fetchCoupons.rejected, failed);

    // Kupon oluştur
    builder
      .addCase(createCoupon.pending, loading)
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.coupons.unshift(action.payload.data);
      })
      .addCase(createCoupon.rejected, failed);

    // Kupon güncelle
    builder
      .addCase(updateCoupon.pending, loading)
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        const updated = action.payload;
        state.coupons = state.coupons.map((c) => (c._id === updated._id ? updated : c));
        if (state.current && state.current._id === updated._id) state.current = updated;
      })
      .addCase(updateCoupon.rejected, failed);

    // Kupon sil
    builder
      .addCase(deleteCoupon.pending, loading)
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        const deletedId = action.meta.arg;
        state.coupons = state.coupons.filter((c) => c._id !== deletedId);
        if (state.current && state.current._id === deletedId) state.current = null;
      })
      .addCase(deleteCoupon.rejected, failed);
  },
});

export const { clearCouponMessages, clearCurrentCoupon } = couponSlice.actions;
export default couponSlice.reducer;
