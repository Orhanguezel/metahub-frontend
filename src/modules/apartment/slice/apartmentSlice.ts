import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IApartment } from "@/modules/apartment/types";

type StatusType = "idle" | "loading" | "succeeded" | "failed";
const BASE = "/apartment";

interface ApartmentState {
  apartment: IApartment[];       // public list
  apartmentAdmin: IApartment[];  // admin list
  selected: IApartment | null;   // detail (public/admin)
  status: StatusType;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ApartmentState = {
  apartment: [],
  apartmentAdmin: [],
  selected: null,
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

/* ----------------- Thunks ----------------- */

/** Public: List (GET /apartment)
 *  Supports: language, neighborhood, cityCode, districtCode, city, zip, q, nearLng, nearLat, nearRadius, service, limit
 */
export const fetchApartment = createAsyncThunk<IApartment[], Record<string, any> | void>(
  "apartment/fetchAllPublic",
  async (params, thunkAPI) => {
    const res = await apiCall("get", `${BASE}`, params || {}, thunkAPI.rejectWithValue);
    return res.data as IApartment[];
  }
);

/** Public: Detail by slug (GET /apartment/:slug) */
export const fetchApartmentBySlug = createAsyncThunk<IApartment, string>(
  "apartment/fetchBySlug",
  async (slug, thunkAPI) => {
    const res = await apiCall("get", `${BASE}/${slug}`, {}, thunkAPI.rejectWithValue);
    return res.data as IApartment;
  }
);

/** Admin: List (GET /apartment/admin?view=admin)
 *  Supports: language, neighborhood, cityCode, districtCode, city, zip, q, isPublished, isActive,
 *            nearLng, nearLat, nearRadius, employee, supervisor, service, cashDay, customer
 */
export const fetchAllApartmentAdmin = createAsyncThunk<IApartment[], Record<string, any> | void>(
  "apartment/fetchAllAdmin",
  async (params, thunkAPI) => {
    const query = { view: "admin", ...(params || {}) }; // 🔸 backend tüm populate'ları bununla yapıyor
    const res = await apiCall("get", `${BASE}/admin`, query, thunkAPI.rejectWithValue);
    return res.data as IApartment[];
  }
);

/** Admin: Detail by ID (GET /apartment/admin/:id?withFinance=1) */
export const fetchApartmentAdminById = createAsyncThunk<IApartment, string>(
  "apartment/fetchAdminById",
  async (id, thunkAPI) => {
    const res = await apiCall("get", `${BASE}/admin/${id}`, { withFinance: 1 }, thunkAPI.rejectWithValue);
    return res.data as IApartment;
  }
);

/** Admin: Create (multipart/form-data) */
export const createApartment = createAsyncThunk(
  "apartment/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall("post", `${BASE}/admin`, formData, thunkAPI.rejectWithValue);
    return res; // { success, message, data }
  }
);

/** Admin: Update (multipart/form-data) */
export const updateApartment = createAsyncThunk(
  "apartment/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall("put", `${BASE}/admin/${id}`, formData, thunkAPI.rejectWithValue);
    return res; // { success, message, data }
  }
);

/** Admin: Delete */
export const deleteApartment = createAsyncThunk(
  "apartment/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall("delete", `${BASE}/admin/${id}`, {}, thunkAPI.rejectWithValue);
    return { id, message: res.message as string | undefined };
  }
);

/** Admin: Toggle Publish */
export const togglePublishApartment = createAsyncThunk(
  "apartment/togglePublish",
  async ({ id, isPublished }: { id: string; isPublished: boolean }, thunkAPI) => {
    const fd = new FormData();
    fd.append("isPublished", String(isPublished));
    const res = await apiCall("put", `${BASE}/admin/${id}`, fd, thunkAPI.rejectWithValue);
    return res; // { success, message, data }
  }
);

/* ----------------- Slice ----------------- */
const apartmentSlice = createSlice({
  name: "apartment",
  initialState,
  reducers: {
    clearApartmentMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setSelectedApartment(state, action: PayloadAction<IApartment | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: ApartmentState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
      state.successMessage = null;
    };

    const setError = (state: ApartmentState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
      state.successMessage = null;
    };

    builder
      // Public List
      .addCase(fetchApartment.pending, startLoading)
      .addCase(fetchApartment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.apartment = action.payload;
      })
      .addCase(fetchApartment.rejected, setError)

      // Public Detail
      .addCase(fetchApartmentBySlug.pending, startLoading)
      .addCase(fetchApartmentBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchApartmentBySlug.rejected, setError)

      // Admin List
      .addCase(fetchAllApartmentAdmin.pending, startLoading)
      .addCase(fetchAllApartmentAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.apartmentAdmin = action.payload;
      })
      .addCase(fetchAllApartmentAdmin.rejected, setError)

      // Admin Detail
      .addCase(fetchApartmentAdminById.pending, startLoading)
      .addCase(fetchApartmentAdminById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchApartmentAdminById.rejected, setError)

      // Create
      .addCase(createApartment.pending, startLoading)
      .addCase(createApartment.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const created = action.payload?.data as IApartment | undefined;
        if (created) state.apartmentAdmin.unshift(created);
        state.successMessage = action.payload?.message || null;
      })
      .addCase(createApartment.rejected, setError)

      // Update
      .addCase(updateApartment.pending, startLoading)
      .addCase(updateApartment.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IApartment = (action.payload?.data || action.payload) as IApartment;
        const idx = state.apartmentAdmin.findIndex((a) => String(a._id) === String(updated._id));
        if (idx !== -1) state.apartmentAdmin[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(updateApartment.rejected, setError)

      // Delete
      .addCase(deleteApartment.pending, startLoading)
      .addCase(deleteApartment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.apartmentAdmin = state.apartmentAdmin.filter(
          (a) => String(a._id) !== String(action.payload.id)
        );
        state.successMessage = action.payload?.message || null;
      })
      .addCase(deleteApartment.rejected, setError)

      // Toggle Publish
      .addCase(togglePublishApartment.pending, startLoading)
      .addCase(togglePublishApartment.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IApartment = (action.payload?.data || action.payload) as IApartment;
        const idx = state.apartmentAdmin.findIndex((a) => String(a._id) === String(updated._id));
        if (idx !== -1) state.apartmentAdmin[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(togglePublishApartment.rejected, setError);
  },
});

export const { clearApartmentMessages, setSelectedApartment } = apartmentSlice.actions;
export default apartmentSlice.reducer;

/* ----------------- Selectors (helpers) ----------------- */
export const selectApartmentAdmin = (s: any) => (s.apartment?.apartmentAdmin ?? []) as IApartment[];
export const selectApartmentPublic = (s: any) => (s.apartment?.apartment ?? []) as IApartment[];
export const selectApartmentSelected = (s: any) => s.apartment?.selected as IApartment | null;

export const selectSelectedOpsEmployeeIds = createSelector(
  selectApartmentSelected,
  (apt) =>
    (apt?.ops?.employees || [])
      .map((e: any) => (typeof e === "string" ? e : e?._id))
      .filter(Boolean) as string[]
);

export const selectSelectedServiceIds = createSelector(
  selectApartmentSelected,
  (apt) =>
    (apt?.ops?.services || [])
      .map((b: any) => (typeof b?.service === "string" ? b.service : b?.service?._id))
      .filter(Boolean) as string[]
);
