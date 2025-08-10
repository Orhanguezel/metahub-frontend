// src/modules/apartment/categorySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ApartmentCategory, TranslatedField } from "@/modules/apartment/types";

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface CategoryState {
  categories: ApartmentCategory[];
  loading: boolean;
  error: string | null;
  status: StatusType;
  successMessage: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  status: "idle",
  successMessage: null,
};

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in payload) {
    const m = (payload as any).message;
    if (typeof m === "string") return m;
  }
  return "An error occurred.";
};

// --- Fetch (opsiyonel filtrelerle) ---
type CategoryFilters = {
  isActive?: boolean;
  city?: string;
  district?: string;
  zip?: string;
};

export const fetchApartmentCategories = createAsyncThunk<
  ApartmentCategory[],
  CategoryFilters | void
>("apartmentCategory/fetchAll", async (filters, thunkAPI) => {
  const qs = new URLSearchParams();
  if (filters?.isActive !== undefined) qs.set("isActive", String(filters.isActive));
  if (filters?.city) qs.set("city", filters.city);
  if (filters?.district) qs.set("district", filters.district);
  if (filters?.zip) qs.set("zip", filters.zip);

  const url = `/apartmentcategory${qs.toString() ? `?${qs}` : ""}`;
  const res = await apiCall("get", url, null, thunkAPI.rejectWithValue);
  // backend: { success, message, data: ApartmentCategory[] }
  return res.data as ApartmentCategory[];
});

// --- Create ---
type CreateCategoryPayload = {
  name: TranslatedField;
  slug?: string;
  city?: string;
  district?: string;
  zip?: string;
  isActive?: boolean;
};

export const createApartmentCategory = createAsyncThunk(
  "apartmentCategory/create",
  async (data: CreateCategoryPayload, thunkAPI) => {
    const res = await apiCall("post", "/apartmentcategory", data, thunkAPI.rejectWithValue);
    // backend: { success, message, data }
    return res;
  }
);

// --- Update ---
type UpdateCategoryPayload = {
  id: string;
  data: {
    name?: TranslatedField;
    slug?: string;
    city?: string;
    district?: string;
    zip?: string;
    isActive?: boolean;
  };
};

export const updateApartmentCategory = createAsyncThunk(
  "apartmentCategory/update",
  async ({ id, data }: UpdateCategoryPayload, thunkAPI) => {
    const res = await apiCall("put", `/apartmentcategory/${id}`, data, thunkAPI.rejectWithValue);
    return res;
  }
);

// --- Delete ---
export const deleteApartmentCategory = createAsyncThunk(
  "apartmentCategory/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall("delete", `/apartmentcategory/${id}`, null, thunkAPI.rejectWithValue);
    // backend: { success, message }
    return { id, message: res.message as string | undefined };
  }
);

const apartmentCategorySlice = createSlice({
  name: "apartmentCategory",
  initialState,
  reducers: {
    clearApartmentCategoryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: CategoryState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
      state.successMessage = null;
    };

    const setError = (state: CategoryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    builder
      // Fetch
      .addCase(fetchApartmentCategories.pending, startLoading)
      .addCase(fetchApartmentCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchApartmentCategories.rejected, setError)

      // Create
      .addCase(createApartmentCategory.pending, startLoading)
      .addCase(createApartmentCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload?.message || null;
        const newCat = action.payload?.data as ApartmentCategory | undefined;
        if (newCat && newCat._id && !state.categories.some((c) => c._id === newCat._id)) {
          state.categories.unshift(newCat);
        }
      })
      .addCase(createApartmentCategory.rejected, setError)

      // Update
      .addCase(updateApartmentCategory.pending, startLoading)
      .addCase(updateApartmentCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload?.message || null;
        const updated = (action.payload?.data || action.payload) as ApartmentCategory;
        const idx = state.categories.findIndex((c) => c._id === updated._id);
        if (idx !== -1) state.categories[idx] = updated;
      })
      .addCase(updateApartmentCategory.rejected, setError)

      // Delete
      .addCase(deleteApartmentCategory.pending, startLoading)
      .addCase(deleteApartmentCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload?.message || null;
        state.categories = state.categories.filter((c) => c._id !== action.payload.id);
      })
      .addCase(deleteApartmentCategory.rejected, setError);
  },
});

export const { clearApartmentCategoryMessages } = apartmentCategorySlice.actions;
export default apartmentCategorySlice.reducer;
