import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { ITenant, TenantsListResponse, MessageResponse } from "../types";

// --- State Type ---
interface TenantState {
  tenants: ITenant[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  selectedTenantId: string | null;
  selectedTenant: ITenant | null;
}

// --- Initial State ---
const initialState: TenantState = {
  tenants: [],
  loading: false,
  error: null,
  successMessage: null,
  selectedTenantId: null,
  selectedTenant: null,
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
    return rejectWithValue({ message: err.message ?? "Fetch failed!" });
  }
});

export const createTenant = createAsyncThunk<
  MessageResponse,
  FormData,
  { rejectValue: { message: string } }
>("tenants/create", async (formData, { rejectWithValue }) => {
  try {
    return await apiCall("post", "/tenants", formData, rejectWithValue);
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
    return await apiCall("put", `/tenants/${id}`, formData, rejectWithValue);
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
    return await apiCall("delete", `/tenants/${id}`, null, rejectWithValue);
  } catch (err: any) {
    return rejectWithValue({ message: err.message ?? "Delete failed!" });
  }
});

// --- Slice ---
const tenantSlice = createSlice({
  name: "tenants",
  initialState,
  reducers: {
    clearTenantMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedTenant: (state, action: PayloadAction<string>) => {
      state.selectedTenantId = action.payload;
      state.selectedTenant =
        state.tenants.find((t) => t._id === action.payload) || null;
    },
    clearSelectedTenant: (state) => {
      state.selectedTenantId = null;
      state.selectedTenant = null;
    },
  },
  extraReducers: (builder) => {
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
        // Tenant listesi değiştiğinde, selectedTenant'ı yeniden derive et!
        if (state.selectedTenantId) {
          state.selectedTenant =
            state.tenants.find((t) => t._id === state.selectedTenantId) || null;
        }
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message?: string } | undefined;
        state.error = payload?.message || "Fetch failed!";
      })

      // createTenant
      .addCase(createTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createTenant.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Tenant created!";
      })
      .addCase(createTenant.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message?: string } | undefined;
        state.error = payload?.message || "Create failed!";
      })

      // updateTenant
      .addCase(updateTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Tenant updated!";
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message?: string } | undefined;
        state.error = payload?.message || "Update failed!";
      })

      // deleteTenant
      .addCase(deleteTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Tenant deleted!";
      })
      .addCase(deleteTenant.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message?: string } | undefined;
        state.error = payload?.message || "Delete failed!";
      });
  },
});

// --- Exports ---
export const { clearTenantMessages, setSelectedTenant, clearSelectedTenant } =
  tenantSlice.actions;

export default tenantSlice.reducer;
