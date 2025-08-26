import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IPromotion,
  PromotionCreatePayload,
  PromotionUpdatePayload,
  IEvaluateResult,
  ICartSnapshot,
} from "../types";

/* ================== State ================== */

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface PromotionsState {
  publicList: IPromotion[];        // GET /promotions
  adminList: IPromotion[];         // GET /promotions/admin
  selected: IPromotion | null;     // GET /promotions/:id
  evaluateResult: IEvaluateResult | null;
  lastRedeemMessage: string | null;

  status: StatusType;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: PromotionsState = {
  publicList: [],
  adminList: [],
  selected: null,
  evaluateResult: null,
  lastRedeemMessage: null,

  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const msg = (payload as any).message;
    if (typeof msg === "string") return msg;
  }
  return "An error occurred.";
};

const BASE = "/promotions";

/* ================== Thunks ================== */
/** PUBLIC: list published (GET /promotions) */
export const fetchPromotionsPublic = createAsyncThunk<
  IPromotion[],
  Record<string, any> | void
>("promotions/fetchPublic", async (params, thunkAPI) => {
  const res = await apiCall("get", `${BASE}`, params || {}, thunkAPI.rejectWithValue);
  return (res?.data ?? res) as IPromotion[];
});

/** PUBLIC: get by code (GET /promotions/check/:code) */
export const fetchPromotionByCode = createAsyncThunk<
  IPromotion | null,
  string
>("promotions/fetchByCode", async (code, thunkAPI) => {
  const res = await apiCall("get", `${BASE}/check/${encodeURIComponent(code)}`, {}, thunkAPI.rejectWithValue);
  return (res?.data ?? res ?? null) as IPromotion | null;
});

/** PUBLIC: evaluate (POST /promotions/evaluate) */
export const evaluatePromotions = createAsyncThunk<
  IEvaluateResult,
  ICartSnapshot
>("promotions/evaluate", async (payload, thunkAPI) => {
  const res = await apiCall("post", `${BASE}/evaluate`, payload, thunkAPI.rejectWithValue);
  return (res?.data ?? res) as IEvaluateResult;
});

/** PUBLIC: redeem code (POST /promotions/redeem) */
export const redeemPromotion = createAsyncThunk<
  { success: boolean; message?: string; data?: any },
  { code: string; orderId: string }
>("promotions/redeem", async ({ code, orderId }, thunkAPI) => {
  const res = await apiCall("post", `${BASE}/redeem`, { code, orderId }, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: any };
});

/** ADMIN: list (GET /promotions/admin) */
export const fetchPromotionsAdmin = createAsyncThunk<
  IPromotion[],
  Record<string, any> | void
>("promotions/fetchAdmin", async (params, thunkAPI) => {
  const res = await apiCall("get", `${BASE}`, params || {}, thunkAPI.rejectWithValue);
  return (res?.data ?? res) as IPromotion[];
});

/** ADMIN: get by id (GET /promotions/:id) */
export const fetchPromotionAdminById = createAsyncThunk<
  IPromotion,
  string
>("promotions/fetchAdminById", async (id, thunkAPI) => {
  const res = await apiCall("get", `${BASE}/${id}`, {}, thunkAPI.rejectWithValue);
  return (res?.data ?? res) as IPromotion;
});

/** ADMIN: create (POST /promotions) */
export const createPromotion = createAsyncThunk<
  { success: boolean; message?: string; data?: IPromotion },
  PromotionCreatePayload
>("promotions/create", async (payload, thunkAPI) => {
  const res = await apiCall("post", `${BASE}`, payload, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IPromotion };
});

/** ADMIN: update (PUT /promotions/:id) */
export const updatePromotion = createAsyncThunk<
  { success: boolean; message?: string; data?: IPromotion },
  { id: string; patch: PromotionUpdatePayload }
>("promotions/update", async ({ id, patch }, thunkAPI) => {
  const res = await apiCall("put", `${BASE}/${id}`, patch, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IPromotion };
});

/** ADMIN: change status (PATCH /promotions/:id/status) */
export const changePromotionStatus = createAsyncThunk<
  { success: boolean; message?: string; data?: IPromotion },
  { id: string; isActive: boolean }
>("promotions/changeStatus", async ({ id, isActive }, thunkAPI) => {
  const res = await apiCall("patch", `${BASE}/${id}/status`, { isActive }, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IPromotion };
});

/** ADMIN: change publish (PATCH /promotions/:id/publish) */
export const changePromotionPublish = createAsyncThunk<
  { success: boolean; message?: string; data?: IPromotion },
  { id: string; isPublished: boolean }
>("promotions/changePublish", async ({ id, isPublished }, thunkAPI) => {
  const res = await apiCall("patch", `${BASE}/${id}/publish`, { isPublished }, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IPromotion };
});

/** ADMIN: delete (DELETE /promotions/:id) */
export const deletePromotion = createAsyncThunk<
  { id: string; message?: string },
  string
>("promotions/delete", async (id, thunkAPI) => {
  const res = await apiCall("delete", `${BASE}/${id}`, {}, thunkAPI.rejectWithValue);
  return { id, message: (res && (res.message as string)) || undefined };
});

/* ================== Slice ================== */

const promotionsSlice = createSlice({
  name: "promotions",
  initialState,
  reducers: {
    clearPromotionMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.lastRedeemMessage = null;
      state.status = "idle";
    },
    setSelectedPromotion(state, action: PayloadAction<IPromotion | null>) {
      state.selected = action.payload;
    },
    clearEvaluateResult(state) {
      state.evaluateResult = null;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: PromotionsState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
      state.successMessage = null;
    };
    const setError = (state: PromotionsState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    /* Public list */
    builder
      .addCase(fetchPromotionsPublic.pending, startLoading)
      .addCase(fetchPromotionsPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.publicList = action.payload;
      })
      .addCase(fetchPromotionsPublic.rejected, setError);

    /* Public by code */
    builder
      .addCase(fetchPromotionByCode.pending, startLoading)
      .addCase(fetchPromotionByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        // public "by code" çoğunlukla sadece gösterim için kullanılır
        state.selected = action.payload ?? null;
      })
      .addCase(fetchPromotionByCode.rejected, setError);

    /* Evaluate */
    builder
      .addCase(evaluatePromotions.pending, startLoading)
      .addCase(evaluatePromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.evaluateResult = action.payload;
      })
      .addCase(evaluatePromotions.rejected, setError);

    /* Redeem */
    builder
      .addCase(redeemPromotion.pending, startLoading)
      .addCase(redeemPromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.lastRedeemMessage =
          action.payload?.message || (action.payload?.success ? "OK" : null);
      })
      .addCase(redeemPromotion.rejected, setError);

    /* Admin list */
    builder
      .addCase(fetchPromotionsAdmin.pending, startLoading)
      .addCase(fetchPromotionsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminList = action.payload;
      })
      .addCase(fetchPromotionsAdmin.rejected, setError);

    /* Admin by id */
    builder
      .addCase(fetchPromotionAdminById.pending, startLoading)
      .addCase(fetchPromotionAdminById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchPromotionAdminById.rejected, setError);

    /* Create */
    builder
      .addCase(createPromotion.pending, startLoading)
      .addCase(createPromotion.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const created = action.payload?.data as IPromotion | undefined;
        if (created) state.adminList.unshift(created);
        state.successMessage = action.payload?.message || null;
      })
      .addCase(createPromotion.rejected, setError);

    /* Update */
    builder
      .addCase(updatePromotion.pending, startLoading)
      .addCase(updatePromotion.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IPromotion = (action.payload?.data || action.payload) as IPromotion;
        const idx = state.adminList.findIndex((p) => String(p._id) === String(updated._id));
        if (idx !== -1) state.adminList[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(updatePromotion.rejected, setError);

    /* Change status */
    builder
      .addCase(changePromotionStatus.pending, startLoading)
      .addCase(changePromotionStatus.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IPromotion = (action.payload?.data || action.payload) as IPromotion;
        const idx = state.adminList.findIndex((p) => String(p._id) === String(updated._id));
        if (idx !== -1) state.adminList[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(changePromotionStatus.rejected, setError);

    /* Change publish */
    builder
      .addCase(changePromotionPublish.pending, startLoading)
      .addCase(changePromotionPublish.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IPromotion = (action.payload?.data || action.payload) as IPromotion;
        const idx = state.adminList.findIndex((p) => String(p._id) === String(updated._id));
        if (idx !== -1) state.adminList[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(changePromotionPublish.rejected, setError);

    /* Delete */
    builder
      .addCase(deletePromotion.pending, startLoading)
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminList = state.adminList.filter(
          (p) => String(p._id) !== String(action.payload.id)
        );
        state.successMessage = action.payload?.message || null;
      })
      .addCase(deletePromotion.rejected, setError);
  },
});

export const {
  clearPromotionMessages,
  setSelectedPromotion,
  clearEvaluateResult,
} = promotionsSlice.actions;

export default promotionsSlice.reducer;

/* ================== Selectors ================== */

export const selectPromotionsPublic = (s: any) =>
  (s.promotions?.publicList ?? []) as IPromotion[];

export const selectPromotionsAdmin = (s: any) =>
  (s.promotions?.adminList ?? []) as IPromotion[];

export const selectPromotionSelected = (s: any) =>
  (s.promotions?.selected ?? null) as IPromotion | null;

export const selectEvaluateResult = (s: any) =>
  (s.promotions?.evaluateResult ?? null) as IEvaluateResult | null;

export const selectPromotionByCode = (code: string) =>
  createSelector(selectPromotionsPublic, (list) =>
    list.find((p) => (p.code || "").toUpperCase() === (code || "").toUpperCase()) || null
  );
