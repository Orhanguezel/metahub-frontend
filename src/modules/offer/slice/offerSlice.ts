import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IOffer,
  OfferStatus,
  CreateOfferDto,
  UpdateOfferDto,
  PatchOfferStatusDto,
  PublicRequestOfferDto,
  PublicRequestOfferResponse,
} from "../types";

type StatusType = "idle" | "loading" | "succeeded" | "failed";

const BASE = "/offer";

interface OffersState {
  offers: IOffer[];
  adminOffers: IOffer[];
  selected: IOffer | null;
  status: StatusType;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  meta?: { page?: number; limit?: number; total?: number } | null;
}

const initialState: OffersState = {
  offers: [],
  adminOffers: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
  meta: null,
};

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const msg = (payload as any).message;
    if (typeof msg === "string") return msg;
  }
  return "An error occurred.";
};

/* ----------------- Thunks (Admin) ----------------- */

export const fetchOffersAdmin = createAsyncThunk<
  { data: IOffer[]; meta?: any },
  | {
      q?: string;
      status?: OfferStatus;
      company?: string;
      customer?: string;
      page?: number;
      limit?: number;
      sort?: string;
      from?: string;
      to?: string;
    }
  | void
>("offers/fetchAllAdmin", async (params, thunkAPI) => {
  const res = await apiCall("get", `${BASE}`, params || {}, thunkAPI.rejectWithValue);
  return { data: res.data as IOffer[], meta: res.meta };
});

export const fetchOfferAdminById = createAsyncThunk<IOffer, string>(
  "offers/fetchAdminById",
  async (id, thunkAPI) => {
    const res = await apiCall("get", `${BASE}/${id}`, {}, thunkAPI.rejectWithValue);
    return res.data as IOffer;
  }
);

export const createOffer = createAsyncThunk<any, CreateOfferDto>(
  "offers/create",
  async (payload, thunkAPI) => {
    const res = await apiCall("post", `${BASE}`, payload, thunkAPI.rejectWithValue);
    return res; // { success, message, data }
  }
);

export const updateOffer = createAsyncThunk<any, { id: string; data: UpdateOfferDto }>(
  "offers/update",
  async ({ id, data }, thunkAPI) => {
    const res = await apiCall("put", `${BASE}/${id}`, data, thunkAPI.rejectWithValue);
    return res; // { success, message, data }
  }
);

/** Patch status (PATCH /offer/:id/status) */
export const updateOfferStatus = createAsyncThunk<any, PatchOfferStatusDto>(
  "offers/updateStatus",
  async ({ id, status, note }, thunkAPI) => {
    const res = await apiCall("patch", `${BASE}/${id}/status`, { status, note }, thunkAPI.rejectWithValue);
    return res; // { success, data: { id, status } }
  }
);

/** Delete */
export const deleteOffer = createAsyncThunk<{ id: string; message?: string }, string>(
  "offers/delete",
  async (id, thunkAPI) => {
    const res = await apiCall("delete", `${BASE}/${id}`, {}, thunkAPI.rejectWithValue);
    return { id, message: res.message as string | undefined };
  }
);

/* ----------------- Thunks (Public) ----------------- */

export const requestOfferPublic = createAsyncThunk<
  PublicRequestOfferResponse,
  PublicRequestOfferDto
>("offers/requestOfferPublic", async (payload, thunkAPI) => {
  const res = await apiCall("post", `${BASE}/request-offer`, payload, thunkAPI.rejectWithValue);
  return res as PublicRequestOfferResponse;
});

/** (Opsiyonel) Eski kullanım için: status=sent tetikleyen thunk */
export const sendOfferEmail = createAsyncThunk<any, { id: string; note?: string }>(
  "offers/sendEmail",
  async ({ id, note }, thunkAPI) => {
    const res = await apiCall("patch", `${BASE}/${id}/status`, { status: "sent", note }, thunkAPI.rejectWithValue);
    return res;
  }
);

/* ----------------- Slice ----------------- */
const offersSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    clearOfferMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setSelectedOffer(state, action: PayloadAction<IOffer | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: OffersState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
      state.successMessage = null;
    };

    const setError = (state: OffersState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
      state.successMessage = null;
    };

    builder
      // List
      .addCase(fetchOffersAdmin.pending, startLoading)
      .addCase(fetchOffersAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminOffers = action.payload.data;
        state.meta = action.payload.meta || null;
      })
      .addCase(fetchOffersAdmin.rejected, setError)

      // Detail
      .addCase(fetchOfferAdminById.pending, startLoading)
      .addCase(fetchOfferAdminById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchOfferAdminById.rejected, setError)

      // Create
      .addCase(createOffer.pending, startLoading)
      .addCase(createOffer.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const created: IOffer | undefined = action.payload?.data;
        if (created) state.adminOffers.unshift(created);
        state.successMessage = action.payload?.message || null;
      })
      .addCase(createOffer.rejected, setError)

      // Update
      .addCase(updateOffer.pending, startLoading)
      .addCase(updateOffer.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IOffer = (action.payload?.data || action.payload) as IOffer;
        const idx = state.adminOffers.findIndex((o) => String(o._id) === String(updated._id));
        if (idx !== -1) state.adminOffers[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(updateOffer.rejected, setError)

      // Patch status
      .addCase(updateOfferStatus.pending, startLoading)
      .addCase(updateOfferStatus.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const patchedId = action.payload?.data?.id;
        const patchedStatus = action.payload?.data?.status as OfferStatus | undefined;
        if (patchedId && patchedStatus) {
          const idx = state.adminOffers.findIndex((o) => String(o._id) === String(patchedId));
          if (idx !== -1) state.adminOffers[idx].status = patchedStatus;
          if (state.selected && String(state.selected._id) === String(patchedId)) {
            state.selected.status = patchedStatus;
          }
        }
        state.successMessage = action.payload?.message || "Status updated.";
      })
      .addCase(updateOfferStatus.rejected, setError)

      // Delete
      .addCase(deleteOffer.pending, startLoading)
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminOffers = state.adminOffers.filter(
          (o) => String(o._id) !== String(action.payload.id)
        );
        state.successMessage = action.payload?.message || null;
      })
      .addCase(deleteOffer.rejected, setError)

      // Public request
      .addCase(requestOfferPublic.pending, startLoading)
      .addCase(requestOfferPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload?.message ?? "Offer request received";
      })
      .addCase(requestOfferPublic.rejected, setError)

      // (opsiyonel) sendEmail
      .addCase(sendOfferEmail.pending, startLoading)
      .addCase(sendOfferEmail.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const msg = action.payload?.message || "Offer email sent.";
        const patchedId = action.payload?.data?.id as string | undefined;
        const patchedStatus = action.payload?.data?.status as OfferStatus | undefined;
        if (patchedId && patchedStatus) {
          const idx = state.adminOffers.findIndex((o) => String(o._id) === String(patchedId));
          if (idx !== -1) state.adminOffers[idx].status = patchedStatus;
          if (state.selected && String(state.selected._id) === String(patchedId)) {
            state.selected.status = patchedStatus;
          }
        }
        state.successMessage = msg;
      })
      .addCase(sendOfferEmail.rejected, setError);
  },
});

export const { clearOfferMessages, setSelectedOffer } = offersSlice.actions;
export default offersSlice.reducer;

/* --------- Selectors (root anahtarınız 'offer' ise uyarlayın) --------- */
export const selectOffersPublic   = (s: any) => (s.offers?.offers ?? s.offer?.offers ?? []) as IOffer[];
export const selectOffersAdmin    = (s: any) => (s.offers?.adminOffers ?? s.offer?.adminOffers ?? []) as IOffer[];
export const selectOfferSelected  = (s: any) => (s.offers?.selected ?? s.offer?.selected ?? null) as IOffer | null;
export const selectOffersLoading  = (s: any) => Boolean(s.offers?.loading ?? s.offer?.loading);
export const selectOffersError    = (s: any) => (s.offers?.error ?? s.offer?.error ?? null) as string | null;
export const selectOffersSuccess  = (s: any) => (s.offers?.successMessage ?? s.offer?.successMessage ?? null) as string | null;
export const selectOffersMeta     = (s: any) => (s.offers?.meta ?? s.offer?.meta ?? null);
