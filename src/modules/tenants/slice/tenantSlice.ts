import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { ITenant, TenantsListResponse, MessageResponse } from "../types";

// --- State Type ---
interface TenantState {
  tenants: ITenant[];         // Public
  tenantsAdmin: ITenant[];    // Admin
  loading: boolean;
  loadingAdmin: boolean;
  error: string | null;
  successMessage: string | null;
  selectedTenantId: string | null;
  selectedTenant: ITenant | null;
}

// --- Initial State ---
const initialState: TenantState = {
  tenants: [],
  tenantsAdmin: [],
  loading: false,
  loadingAdmin: false,
  error: null,
  successMessage: null,
  selectedTenantId: null,
  selectedTenant: null,
};

// --- LOCAL/DEV tenant slug override (prod'da asla kullanılmaz) ---
const getLocalTenantSlug = (): string | undefined => {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return (
      process.env.NEXT_PUBLIC_APP_ENV ||
      process.env.NEXT_PUBLIC_TENANT_NAME ||
      process.env.TENANT_NAME
    );
  }
  return undefined;
};

// --- Async Thunks ---
// 1️⃣ Public fetch (aktif tenantlar)
export const fetchTenants = createAsyncThunk<
  TenantsListResponse,
  void,
  { rejectValue: { message: string } }
>("tenants/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiCall("get", "/tenants", null, rejectWithValue);
  } catch (err: any) {
    return rejectWithValue({ message: err.message ?? "Fetch failed!" });
  }
});

// 2️⃣ Admin fetch (tüm tenantlar)
export const fetchTenantsAdmin = createAsyncThunk<
  TenantsListResponse,
  void,
  { rejectValue: { message: string } }
>("tenants/fetchAllAdmin", async (_, { rejectWithValue }) => {
  try {
    return await apiCall("get", "/tenants/admin", null, rejectWithValue);
  } catch (err: any) {
    return rejectWithValue({ message: err.message ?? "Admin fetch failed!" });
  }
});

// 3️⃣ CRUD (admin endpointleri)
// Dikkat: Endpointler backend'de "/tenants/admin" prefixli!
export const createTenant = createAsyncThunk<
  MessageResponse,
  FormData,
  { rejectValue: { message: string } }
>("tenants/create", async (formData, { rejectWithValue }) => {
  try {
    return await apiCall("post", "/tenants/admin", formData, rejectWithValue);
  } catch (err: any) {
    return rejectWithValue({ message: err.message ?? "Create failed!" });
  }
});
export const updateTenant = createAsyncThunk<
  MessageResponse,
  { id: string; formData: FormData },
  { rejectValue: { message: string } }
>("tenants/update", async ({ id, formData }, { rejectWithValue }) => {
  try {
    return await apiCall("put", `/tenants/admin/${id}`, formData, rejectWithValue);
  } catch (err: any) {
    return rejectWithValue({ message: err.message ?? "Update failed!" });
  }
});
export const deleteTenant = createAsyncThunk<
  MessageResponse,
  string,
  { rejectValue: { message: string } }
>("tenants/delete", async (id, { rejectWithValue }) => {
  try {
    return await apiCall("delete", `/tenants/admin/${id}`, null, rejectWithValue);
  } catch (err: any) {
    return rejectWithValue({ message: err.message ?? "Delete failed!" });
  }
});

// --- Slice ---
const tenantSlice = createSlice({
  name: "tenants",
  initialState,
  reducers: {
    setTenants(state, action: PayloadAction<ITenant[]>) {
      state.tenants = action.payload;
      // Sadece localde .env override varsa otomatik tenant seç
      const localTenantSlug = getLocalTenantSlug();
      if (localTenantSlug) {
        const found = state.tenants.find(
          (t) => t.slug === localTenantSlug || t._id === localTenantSlug
        );
        if (found) {
          state.selectedTenantId = found._id ?? null;
          state.selectedTenant = found;
        }
      }
    },
    clearTenantMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedTenant(state, action: PayloadAction<ITenant | null>) {
      state.selectedTenant = action.payload;
      state.selectedTenantId = action.payload?._id ?? null;
    },
    clearSelectedTenant(state) {
      state.selectedTenantId = null;
      state.selectedTenant = null;
    },
    setSelectedTenantId(state, action: PayloadAction<string | null>) {
      state.selectedTenantId = action.payload;
      // selectedTenant objesini state.tenants listesinde bul
      const tenantObj =
        state.tenants.find((t) => t._id === action.payload) || null;
      state.selectedTenant = tenantObj;
    },
  },
  extraReducers: (builder) => {
    // --- PUBLIC FETCH ---
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload.data || [];
        state.successMessage = action.payload.message || null;
        // LOCAL: otomatik tenant seçimi
        const localTenantSlug = getLocalTenantSlug();
        if (localTenantSlug && state.tenants.length > 0) {
          const found = state.tenants.find(
            (t) => t.slug === localTenantSlug || t._id === localTenantSlug
          );
          if (found) {
            state.selectedTenantId = found._id ?? null;
            state.selectedTenant = found;
          }
        }
        // selectedTenantId validasyonu
        if (state.selectedTenantId) {
          const stillThere = state.tenants.find(
            (t) => t._id === state.selectedTenantId
          );
          if (!stillThere) {
            state.selectedTenantId = null;
            state.selectedTenant = null;
          }
        }
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message?: string } | undefined;
        state.error = payload?.message || "Fetch failed!";
      });

    // --- ADMIN FETCH ---
    builder
      .addCase(fetchTenantsAdmin.pending, (state) => {
        state.loadingAdmin = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(fetchTenantsAdmin.fulfilled, (state, action) => {
        state.loadingAdmin = false;
        state.tenantsAdmin = action.payload.data || [];
        state.successMessage = action.payload.message || null;
      })
      .addCase(fetchTenantsAdmin.rejected, (state, action) => {
        state.loadingAdmin = false;
        const payload = action.payload as { message?: string } | undefined;
        state.error = payload?.message || "Admin fetch failed!";
      });

    // --- CRUD ---
    builder
      .addCase(createTenant.fulfilled, (state, action) => {
        state.successMessage = action.payload.message || "Tenant created!";
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.successMessage = action.payload.message || "Tenant updated!";
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.successMessage = action.payload.message || "Tenant deleted!";
      })
      // Error handling for all
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          const payload = (action as any).payload;
          state.loading = false;
          state.loadingAdmin = false;
          state.error =
            typeof payload === "string"
              ? payload
              : (payload && typeof payload === "object" && "message" in payload && payload.message) ||
                "Operation failed.";
        }
      );
  },
});

export const {
  setTenants,
  clearTenantMessages,
  setSelectedTenantId,
  setSelectedTenant,
  clearSelectedTenant,
} = tenantSlice.actions;

export default tenantSlice.reducer;
