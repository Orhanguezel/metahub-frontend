import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Coupon } from "@/modules/coupon";

interface CouponState {
  coupons: Coupon[];
  couponsAdmin: Coupon[];
  selected: Coupon | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CouponState = {
  coupons: [],
  couponsAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const BASE = "/coupon";

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

export const fetchCoupon = createAsyncThunk<Coupon[]>(
  "coupon/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `${BASE}`, null, thunkAPI.rejectWithValue);
    // response: { success, message, data }
    return res.data;
  }
);


export const checkCouponByCode = createAsyncThunk<Coupon | null, string>(
  "coupon/checkByCode",
  async (code: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `${BASE}/check/${code}`,
      null,
      thunkAPI.rejectWithValue
    );
    // response: { success, message, data }
    return res.data || null;
  }
);

export const fetchCouponsAdmin = createAsyncThunk<Coupon[]>(
  "coupon/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `${BASE}/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const createCoupon = createAsyncThunk(
  "coupon/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      `${BASE}/admin`,
      formData,
      thunkAPI.rejectWithValue
    );
    // return: { success, message, data }
    return { ...res, data: res.data };
  }
);

export const updateCoupon = createAsyncThunk(
  "coupon/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `${BASE}/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data };
  }
);

export const deleteCoupon = createAsyncThunk(
  "coupon/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `${BASE}/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    // return: { success, message }
    return { id, message: res.message };
  }
);

export const togglePublishCoupon = createAsyncThunk(
  "coupon/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `${BASE}/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data };
  }
);

export const fetchCouponBySlug = createAsyncThunk(
  "coupon/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `${BASE}/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---
const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    clearCouponMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedCoupon: (state, action: PayloadAction<Coupon | null>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: CouponState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };

    const setError = (state: CouponState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public
    builder
      .addCase(fetchCoupon.pending, setLoading)
      .addCase(fetchCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.coupons = action.payload;
      })
      .addCase(fetchCoupon.rejected, setError);

    // ✅ Check by code
    builder
      .addCase(checkCouponByCode.pending, setLoading)
      .addCase(checkCouponByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(checkCouponByCode.rejected, setError);

    // 🔐 Admin List
    builder
      .addCase(fetchCouponsAdmin.pending, setLoading)
      .addCase(fetchCouponsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.couponsAdmin = action.payload;
      })
      .addCase(fetchCouponsAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createCoupon.pending, setLoading)
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.couponsAdmin.unshift(action.payload.data);
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(createCoupon.rejected, setError);

    // 📝 Update
    builder
      .addCase(updateCoupon.pending, setLoading)
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.couponsAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.couponsAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(updateCoupon.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deleteCoupon.pending, setLoading)
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.couponsAdmin = state.couponsAdmin.filter((a) => a._id !== action.payload.id);
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(deleteCoupon.rejected, setError);

    // 🌍 Toggle Publish
    builder
      .addCase(togglePublishCoupon.pending, setLoading)
      .addCase(togglePublishCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.couponsAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.couponsAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(togglePublishCoupon.rejected, setError);

    // 🔎 Single (Slug)
    builder
      .addCase(fetchCouponBySlug.pending, setLoading)
      .addCase(fetchCouponBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchCouponBySlug.rejected, setError);
  },
});

export const { clearCouponMessages, setSelectedCoupon } = couponSlice.actions;
export default couponSlice.reducer;
