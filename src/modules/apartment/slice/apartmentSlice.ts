// src/modules/apartment/slice/apartmentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IApartment } from "@/modules/apartment/types";

type StatusType = "idle" | "loading" | "succeeded" | "failed";

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

// ---------- Async Thunks ----------

// Public: List (opsiyonel filtreler desteklenir)
export const fetchApartment = createAsyncThunk<
  IApartment[],
  Record<string, any> | void
>("apartment/fetchAllPublic", async (params, thunkAPI) => {
  const res = await apiCall(
    "get",
    `/apartment`,
    null,
    thunkAPI.rejectWithValue,
    params ? { params } : undefined
  );
  // backend: { success, message, data }
  return res.data;
});

// Admin: List (opsiyonel filtreler)
export const fetchAllApartmentAdmin = createAsyncThunk<
  IApartment[],
  Record<string, any> | void
>("apartment/fetchAllAdmin", async (params, thunkAPI) => {
  const res = await apiCall(
    "get",
    `/apartment/admin`,
    null,
    thunkAPI.rejectWithValue,
    params ? { params } : undefined
  );
  return res.data;
});

// Admin: Create (multipart/form-data)
export const createApartment = createAsyncThunk(
  "apartment/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/apartment/admin",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    // { success, message, data }
    return res;
  }
);

// Admin: Update (multipart/form-data)
export const updateApartment = createAsyncThunk(
  "apartment/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/apartment/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res; // { success, message, data }
  }
);

// Admin: Delete
export const deleteApartment = createAsyncThunk(
  "apartment/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/apartment/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message as string | undefined };
  }
);

// Admin: Toggle Publish (PUT ile isPublished gönderilir)
export const togglePublishApartment = createAsyncThunk(
  "apartment/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/apartment/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res; // { success, message, data }
  }
);

// Public: Detail by slug
export const fetchApartmentBySlug = createAsyncThunk<IApartment, string>(
  "apartment/fetchBySlug",
  async (slug, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/apartment/public/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// (Opsiyonel) Admin: Get by ID — backend’le birebir
export const fetchApartmentAdminById = createAsyncThunk<IApartment, string>(
  "apartment/fetchAdminById",
  async (id, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/apartment/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ---------- Slice ----------
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

      // Public Detail (slug)
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

      // (Opsiyonel) Admin Detail by ID
      .addCase(fetchApartmentAdminById.pending, startLoading)
      .addCase(fetchApartmentAdminById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchApartmentAdminById.rejected, setError)

      // Create
      .addCase(createApartment.pending, startLoading)
      .addCase(createApartment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const created = action.payload?.data;
        if (created) {
          state.apartmentAdmin.unshift(created);
          state.successMessage = action.payload?.message || null;
        }
      })
      .addCase(createApartment.rejected, setError)

      // Update
      .addCase(updateApartment.pending, startLoading)
      .addCase(updateApartment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IApartment = action.payload?.data || action.payload;
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
      .addCase(togglePublishApartment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IApartment = action.payload?.data || action.payload;
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
