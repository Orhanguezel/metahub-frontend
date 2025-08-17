import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { ITenant, TenantsListResponse, MessageResponse } from "../types";

const initialTenantSlug = (() => {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return (
      process.env.NEXT_PUBLIC_APP_ENV ||
      process.env.NEXT_PUBLIC_TENANT_NAME ||
      process.env.TENANT_NAME
    );
  }
  return undefined;
})();

// --- State Type ---
interface TenantState {
  tenants: ITenant[];        // Public
  tenantsAdmin: ITenant[];   // Admin
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
  selectedTenant: initialTenantSlug ? ({ slug: initialTenantSlug } as ITenant) : null,
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

// --- Helper: Local tenant seçimi ---
const setLocalTenantIfAvailable = (state: TenantState) => {
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
};

// --- Admin çağrıları için platform/bypass opsiyonları ---
// NOT: apiCall tipin 4 parametre alıyorsa TS uyarısını aşmak için (apiCall as any) kullandık.
const PLATFORM_OPTS = {
  noTenantHeader: true,                 // apiCall bu opsiyonu okuyorsa tenant header'ını basmaz
  headers: { "x-platform": "1" },       // backend'te varsa platform-whitelist için sinyal
};

// --- Async Thunks ---
export const fetchTenants = createAsyncThunk<
  TenantsListResponse,
  void,
  { rejectValue: { message: string } }
>("tenants/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiCall("get", "/tenants", null, rejectWithValue);
  } catch (err: any) {
    return rejectWithValue({ message: err?.message ?? "Fetch failed!" });
  }
});

export const fetchTenantsAdmin = createAsyncThunk<
  TenantsListResponse,
  void,
  { rejectValue: { message: string } }
>("tenants/fetchAllAdmin", async (_, { rejectWithValue }) => {
  try {
    return await (apiCall as any)(
      "get",
      "/tenants/admin",
      null,
      rejectWithValue,
      PLATFORM_OPTS
    );
  } catch (err: any) {
    return rejectWithValue({ message: err?.message ?? "Admin fetch failed!" });
  }
});

export const createTenant = createAsyncThunk<
  MessageResponse,
  FormData,
  { rejectValue: { message: string } }
>("tenants/create", async (formData, { rejectWithValue }) => {
  try {
    return await (apiCall as any)(
      "post",
      "/tenants/admin",
      formData,
      rejectWithValue,
      PLATFORM_OPTS
    );
  } catch (err: any) {
    return rejectWithValue({ message: err?.message ?? "Create failed!" });
  }
});

export const updateTenant = createAsyncThunk<
  MessageResponse,
  { id: string; formData: FormData },
  { rejectValue: { message: string } }
>("tenants/update", async ({ id, formData }, { rejectWithValue }) => {
  try {
    return await (apiCall as any)(
      "put",
      `/tenants/admin/${id}`,
      formData,
      rejectWithValue,
      PLATFORM_OPTS
    );
  } catch (err: any) {
    return rejectWithValue({ message: err?.message ?? "Update failed!" });
  }
});

export const deleteTenant = createAsyncThunk<
  MessageResponse,
  string,
  { rejectValue: { message: string } }
>("tenants/delete", async (id, { rejectWithValue }) => {
  try {
    return await (apiCall as any)(
      "delete",
      `/tenants/admin/${id}`,
      null,
      rejectWithValue,
      PLATFORM_OPTS
    );
  } catch (err: any) {
    return rejectWithValue({ message: err?.message ?? "Delete failed!" });
  }
});

// --- Slice ---
const tenantSlice = createSlice({
  name: "tenants",
  initialState,
  reducers: {
    setTenants(state, action: PayloadAction<ITenant[]>) {
      state.tenants = action.payload;
      setLocalTenantIfAvailable(state);
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
      state.selectedTenant =
        state.tenants.find((t) => t._id === action.payload) || null;
    },
  },
  extraReducers: (builder) => {
    builder
      // PUBLIC FETCH
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload.data || [];
        state.successMessage = action.payload.message || null;
        if (!state.selectedTenant) {
          const slug = getLocalTenantSlug();
          if (slug) {
            const found = state.tenants.find(
              (t) => t.slug === slug || t._id === slug
            );
            if (found) state.selectedTenant = found;
          }
        }
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message?: string } | undefined;
        state.error = payload?.message || "Fetch failed!";
      })

      // ADMIN FETCH
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
      })

      // CRUD
      .addCase(createTenant.fulfilled, (state, action) => {
        state.successMessage = action.payload.message || "Tenant created!";
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.successMessage = action.payload.message || "Tenant updated!";
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.successMessage = action.payload.message || "Tenant deleted!";
      })

      // Global Error Handling
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.loadingAdmin = false;
          const payload = (action as any).payload;
          state.error =
            typeof payload === "string"
              ? payload
              : (payload &&
                  typeof payload === "object" &&
                  "message" in payload &&
                  payload.message) ||
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
