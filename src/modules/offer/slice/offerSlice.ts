import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Offer } from "@/modules/offer/types";

// --- State ---
interface OffersState {
  offers: Offer[];
  adminOffers: Offer[];
  selected: Offer | null;
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}

const initialState: OffersState = {
  offers: [],
  adminOffers: [],
  selected: null,
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
};

// --- Async Thunks ---

// 1️⃣ Teklif oluştur
export const createOffer = createAsyncThunk<
  Offer,
  Partial<Offer>,
  { rejectValue: { status: number | string; message: string; data?: any } }
>("offers/createOffer", async (data, thunkAPI) => {
  const res = await apiCall("post", "/offer", data, thunkAPI.rejectWithValue);
  if (!res.success) return thunkAPI.rejectWithValue({ status: 400, message: res.message, data: res });
  return res.offer as Offer;
});

// 2️⃣ Teklifleri listele (kullanıcıya ait)
export const fetchOffers = createAsyncThunk<
  Offer[]
>("offers/fetchOffers", async (_, thunkAPI) => {
  const res = await apiCall("get", "/offer", null, thunkAPI.rejectWithValue);
  return res.data as Offer[];
});

// 3️⃣ Admin: Tüm teklifleri getir (admin paneli)
export const fetchAdminOffers = createAsyncThunk<
  Offer[]
>("offers/fetchAdminOffers", async (_, thunkAPI) => {
  const res = await apiCall("get", "/offer", null, thunkAPI.rejectWithValue);
  return res.data as Offer[];
});

// 4️⃣ Teklif detay (id ile)
export const fetchOfferById = createAsyncThunk<
  Offer,
  string
>("offers/fetchOfferById", async (id, thunkAPI) => {
  const res = await apiCall("get", `/offer/${id}`, null, thunkAPI.rejectWithValue);
  return res.data as Offer;
});

// 5️⃣ Teklif güncelle (id ile)
export const updateOffer = createAsyncThunk<
  Offer,
  { id: string; data: Partial<Offer> }
>("offers/updateOffer", async ({ id, data }, thunkAPI) => {
  const res = await apiCall("put", `/offer/${id}`, data, thunkAPI.rejectWithValue);
  if (!res.success) return thunkAPI.rejectWithValue({ status: 400, message: res.message, data: res });
  return res.data as Offer;
});

// 6️⃣ Teklif durumunu güncelle (id ile)
export const updateOfferStatus = createAsyncThunk<
  Offer,
  { id: string; status: Offer["status"] }
>("offers/updateOfferStatus", async ({ id, status }, thunkAPI) => {
  const res = await apiCall("patch", `/offer/${id}/status`, { status }, thunkAPI.rejectWithValue);
  if (!res.success) return thunkAPI.rejectWithValue({ status: 400, message: res.message, data: res });
  return res.data as Offer;
});

// 7️⃣ Teklifi sil (id ile)
export const deleteOffer = createAsyncThunk<
  string, // Silinen teklif ID'si döneriz
  string
>("offers/deleteOffer", async (id, thunkAPI) => {
  const res = await apiCall("delete", `/offer/${id}`, null, thunkAPI.rejectWithValue);
  if (!res.success) return thunkAPI.rejectWithValue({ status: 400, message: res.message, data: res });
  return id;
});

// 8️⃣ Manuel PDF generate
export const generateOfferPdf = createAsyncThunk<
  { pdfUrl: string; offerId: string },
  string
>("offers/generateOfferPdf", async (id, thunkAPI) => {
  const res = await apiCall("post", `/offer/${id}/generate-pdf`, null, thunkAPI.rejectWithValue);
  if (!res.success && res.message) return thunkAPI.rejectWithValue({ status: 400, message: res.message, data: res });
  return { pdfUrl: res.pdfUrl, offerId: res.offerId };
});

// --- Slice ---
const offerSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    clearOfferMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedOffer(state, action: PayloadAction<Offer | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createOffer.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = "Teklif başarıyla oluşturuldu.";
        state.offers.unshift(action.payload);
      })
      .addCase(createOffer.rejected, (state, action: any) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload?.message || "Teklif oluşturulamadı.";
      })

      // Fetch Offers
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.offers = action.payload;
      })
      .addCase(fetchOffers.rejected, (state, action: any) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload?.message || "Teklifler yüklenemedi.";
      })

      // Fetch Admin Offers
      .addCase(fetchAdminOffers.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminOffers = action.payload;
      })
      .addCase(fetchAdminOffers.rejected, (state, action: any) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload?.message || "Admin teklif listesi yüklenemedi.";
      })

      // Fetch By Id
      .addCase(fetchOfferById.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOfferById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchOfferById.rejected, (state, action: any) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload?.message || "Teklif bulunamadı.";
      })

      // Update Offer
      .addCase(updateOffer.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = "Teklif güncellendi.";
        // Güncellenen teklifi offers içinde replace et
        state.offers = state.offers.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
        if (state.selected?._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateOffer.rejected, (state, action: any) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload?.message || "Teklif güncellenemedi.";
      })

      // Update Status
      .addCase(updateOfferStatus.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateOfferStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = "Teklif durumu güncellendi.";
        // Offers içinde güncelle
        state.offers = state.offers.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
        if (state.selected?._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateOfferStatus.rejected, (state, action: any) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload?.message || "Durum güncellenemedi.";
      })

      // Delete
      .addCase(deleteOffer.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = "Teklif silindi.";
        state.offers = state.offers.filter((o) => o._id !== action.payload);
        state.selected = null;
      })
      .addCase(deleteOffer.rejected, (state, action: any) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload?.message || "Teklif silinemedi.";
      })

      // Generate PDF
      .addCase(generateOfferPdf.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(generateOfferPdf.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = "PDF başarıyla oluşturuldu.";
        // İlgili teklifin pdfUrl'sini güncelle
        state.offers = state.offers.map((o) =>
          o._id === action.payload.offerId ? { ...o, pdfUrl: action.payload.pdfUrl } : o
        );
        if (state.selected?._id === action.payload.offerId) {
          state.selected = { ...state.selected, pdfUrl: action.payload.pdfUrl };
        }
      })
      .addCase(generateOfferPdf.rejected, (state, action: any) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload?.message || "PDF oluşturulamadı.";
      });
  },
});

export const { clearOfferMessages, setSelectedOffer } = offerSlice.actions;
export default offerSlice.reducer;
