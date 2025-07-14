import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { toast } from "react-toastify";
import type { IModuleSetting } from "../types";
import { RootState } from "@/store";

// --- State Tipi ---
interface ModuleSettingState {
  tenantModules: IModuleSetting[];
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}

const initialState: ModuleSettingState = {
  tenantModules: [],
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
};

// --- THUNKS ---

// 1. Fetch all settings for a tenant
export const fetchTenantModuleSettings = createAsyncThunk<
  IModuleSetting[],
  void,
  { rejectValue: string; state: RootState }
>("moduleSetting/fetchTenantModules", async (_, thunkAPI) => {
  const tenantId = thunkAPI.getState().tenants.selectedTenantId; // ✅ Doğrusu tenants!
  if (!tenantId) return thunkAPI.rejectWithValue("No tenant selected!");
  const res = await apiCall(
    "get",
    `/modules/setting/${tenantId}`,
    null,
    thunkAPI.rejectWithValue,
    { withCredentials: true }
  );
  return res.data;
});

// 2. Update setting (override)
export const updateModuleSetting = createAsyncThunk<
  IModuleSetting,
  Partial<IModuleSetting>,
  { rejectValue: string }
>("moduleSetting/update", async (payload, thunkAPI) => {
  try {
    const res = await apiCall(
      "patch",
      "/modules/setting",
      payload,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Update failed");
  }
});

// 3. Batch update
export const batchUpdateModuleSetting = createAsyncThunk<
  IModuleSetting[],
  Partial<IModuleSetting>[],
  { rejectValue: string }
>("moduleSetting/batchUpdate", async (payload, thunkAPI) => {
  try {
    const res = await apiCall(
      "patch",
      "/modules/setting/batch-update",
      payload,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Batch update failed");
  }
});

// 4. Delete module setting (tenant+module)
export const deleteModuleSetting = createAsyncThunk<
  { module: string; tenant: string },
  { module: string; tenant: string },
  { rejectValue: string }
>("moduleSetting/delete", async (payload, thunkAPI) => {
  try {
    await apiCall(
      "delete",
      "/modules/setting",
      payload,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return payload;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Delete failed");
  }
});

// 5. Delete all settings for tenant
export const deleteAllSettingsForTenant = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("moduleSetting/deleteAllForTenant", async (tenant, thunkAPI) => {
  try {
    await apiCall(
      "delete",
      `/modules/setting/tenant/${tenant}`,
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return tenant;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Delete failed");
  }
});

// --- SLICE ---
const moduleSettingSlice = createSlice({
  name: "moduleSetting",
  initialState,
  reducers: {
    clearModuleSettingMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // GET tenantModules
    builder.addCase(
      fetchTenantModuleSettings.fulfilled,
      (state, action: PayloadAction<IModuleSetting[]>) => {
        state.tenantModules = action.payload; // ✅
        state.loading = false;
      }
    );
    // UPDATE one
    builder.addCase(
      updateModuleSetting.fulfilled,
      (state, action: PayloadAction<IModuleSetting>) => {
        const idx = state.tenantModules.findIndex(
          (m: IModuleSetting) =>
            m.module === action.payload.module &&
            m.tenant === action.payload.tenant
        );
        if (idx !== -1) state.tenantModules[idx] = action.payload;
        state.successMessage = "Tenant module setting updated.";
        toast.success(state.successMessage);
        state.loading = false;
      }
    );
    // BATCH update
    builder.addCase(
      batchUpdateModuleSetting.fulfilled,
      (state, action: PayloadAction<IModuleSetting[]>) => {
        state.tenantModules = action.payload;
        state.successMessage = "Batch module settings updated.";
        toast.success(state.successMessage);
        state.loading = false;
      }
    );
    // DELETE one
    builder.addCase(
      deleteModuleSetting.fulfilled,
      (state, action: PayloadAction<{ module: string; tenant: string }>) => {
        const { module, tenant } = action.payload;
        state.tenantModules = state.tenantModules.filter(
          (m: IModuleSetting) => m.module !== module || m.tenant !== tenant
        );
        state.successMessage = "Tenant module setting deleted.";
        toast.success(state.successMessage);
        state.loading = false;
      }
    );
    // DELETE all for tenant
    builder.addCase(
      deleteAllSettingsForTenant.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.tenantModules = [];
        state.successMessage = "All tenant settings deleted.";
        toast.success(`${state.successMessage} for tenant: ${action.payload}`);
        state.loading = false;
      }
    );
    // PENDING matcher
    builder.addMatcher(
      (action) =>
        action.type.startsWith("moduleSetting/") &&
        action.type.endsWith("/pending"),
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );
    // REJECTED matcher
    builder.addMatcher(
      (action) =>
        action.type.startsWith("moduleSetting/") &&
        action.type.endsWith("/rejected"),
      (state, action: any) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.payload || "Operation failed!";
        toast.error(state.error);
      }
    );
  },
});

export const { clearModuleSettingMessages } = moduleSettingSlice.actions;
export default moduleSettingSlice.reducer;
