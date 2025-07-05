import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { toast } from "react-toastify";

// --- STATE TYPES ---
interface ModuleTenantMatrix {
  [tenant: string]: string[]; // ör: { "ensotek": ["blog", "product", ...] }
}
interface MaintenanceLog {
  [key: string]: any;
}
interface OrphanRecord {
  [key: string]: any;
}

interface ModuleMaintenanceState {
  moduleTenantMatrix: ModuleTenantMatrix;
  maintenanceLogs: MaintenanceLog[];
  repaired: any[];
  deletedCount: number;
  orphans: OrphanRecord[];
  maintenanceLoading: boolean;
  maintenanceError: string | null;
  successMessage: string | null;
  lastAction: string;
}

const initialState: ModuleMaintenanceState = {
  moduleTenantMatrix: {},
  maintenanceLogs: [],
  repaired: [],
  deletedCount: 0,
  orphans: [],
  maintenanceLoading: false,
  maintenanceError: null,
  successMessage: null,
  lastAction: "",
};

// --- ASYNC THUNKS ---

// 1. Tüm modül-tenant matrixini getir
export const fetchModuleTenantMatrix = createAsyncThunk<
  ModuleTenantMatrix,
  void,
  { rejectValue: string }
>("moduleMaintenance/fetchModuleTenantMatrix", async (_, thunkAPI) => {
  try {
    const res = await apiCall(
      "get",
      "/modules/maintenance/matrix",
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Fetch failed");
  }
});

// 2. Tek tenant’a tüm modüllerin atanması
export const assignAllModulesToTenant = createAsyncThunk<
  MaintenanceLog,
  string,
  { rejectValue: string }
>("moduleMaintenance/assignAllModulesToTenant", async (tenant, thunkAPI) => {
  try {
    const res = await apiCall(
      "post",
      "/modules/maintenance/batch-assign",
      { tenant },
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Assign failed");
  }
});

// 3. Tüm tenantlara bir modül ata (global assign)
export const assignModuleToAllTenants = createAsyncThunk<
  MaintenanceLog,
  string,
  { rejectValue: string }
>("moduleMaintenance/assignModuleToAllTenants", async (module, thunkAPI) => {
  try {
    const res = await apiCall(
      "post",
      "/modules/maintenance/global-assign",
      { module },
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Assign failed");
  }
});

// 4. Health check/eksikleri tamamlama
export const repairModuleSettings = createAsyncThunk<
  any[],
  void,
  { rejectValue: string }
>("moduleMaintenance/repairModuleSettings", async (_, thunkAPI) => {
  try {
    const res = await apiCall(
      "post",
      "/modules/maintenance/repair-settings",
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data?.repaired || [];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Repair failed");
  }
});

// 5. Bir tenant’ın tüm modül ayarlarını sil (mapping cleanup)
export const removeAllModulesFromTenant = createAsyncThunk<
  { deletedCount: number },
  string,
  { rejectValue: string }
>("moduleMaintenance/removeAllModulesFromTenant", async (tenant, thunkAPI) => {
  try {
    const res = await apiCall(
      "delete",
      "/modules/maintenance/tenant-cleanup",
      { tenant },
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Cleanup failed");
  }
});

// 6. Bir modülü tüm tenantlardan sil (global cleanup)
export const removeModuleFromAllTenants = createAsyncThunk<
  { deletedCount: number },
  string,
  { rejectValue: string }
>("moduleMaintenance/removeModuleFromAllTenants", async (module, thunkAPI) => {
  try {
    const res = await apiCall(
      "delete",
      "/modules/maintenance/global-cleanup",
      { module },
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Global cleanup failed");
  }
});

// 7. Orphan (meta olmayan) settings’leri temizle
export const cleanupOrphanModuleSettings = createAsyncThunk<
  { deletedCount: number; orphans: OrphanRecord[] },
  void,
  { rejectValue: string }
>("moduleMaintenance/cleanupOrphanModuleSettings", async (_, thunkAPI) => {
  try {
    const res = await apiCall(
      "delete",
      "/modules/maintenance/cleanup-orphan",
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Cleanup failed");
  }
});

// 8. Batch update (tüm tenantlarda topluca güncelle)
export const batchUpdateModuleSetting = createAsyncThunk<
  MaintenanceLog,
  { module: string; update: any },
  { rejectValue: string }
>(
  "moduleMaintenance/batchUpdateModuleSetting",
  async ({ module, update }, thunkAPI) => {
    try {
      const res = await apiCall(
        "patch",
        "/modules/maintenance/batch-update",
        { module, update },
        thunkAPI.rejectWithValue,
        { withCredentials: true }
      );
      toast.success("Batch module update completed.");
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message ?? "Batch update failed");
    }
  }
);

// --- SLICE ---
const moduleMaintenanceSlice = createSlice({
  name: "moduleMaintenance",
  initialState,
  reducers: {
    clearMaintenanceState: (state) => {
      state.maintenanceError = null;
      state.maintenanceLogs = [];
      state.repaired = [];
      state.deletedCount = 0;
      state.orphans = [];
      state.successMessage = null;
      state.lastAction = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchModuleTenantMatrix.fulfilled,
        (state, action: PayloadAction<ModuleTenantMatrix>) => {
          state.moduleTenantMatrix = action.payload || {};
          state.maintenanceLoading = false;
        }
      )
      .addCase(
        assignAllModulesToTenant.fulfilled,
        (state, action: PayloadAction<MaintenanceLog>) => {
          state.maintenanceLogs = [action.payload];
          state.successMessage = "All modules assigned to tenant.";
          toast.success(state.successMessage);
          state.maintenanceLoading = false;
        }
      )
      .addCase(
        assignModuleToAllTenants.fulfilled,
        (state, action: PayloadAction<MaintenanceLog>) => {
          state.maintenanceLogs = [action.payload];
          state.successMessage = "Module assigned to all tenants.";
          toast.success(state.successMessage);
          state.maintenanceLoading = false;
        }
      )
      .addCase(
        repairModuleSettings.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.repaired = action.payload;
          state.successMessage = "Missing settings repaired.";
          toast.success(state.successMessage);
          state.maintenanceLoading = false;
        }
      )
      .addCase(
        removeAllModulesFromTenant.fulfilled,
        (state, action: PayloadAction<{ deletedCount: number }>) => {
          state.deletedCount = action.payload.deletedCount;
          state.successMessage = "All module mappings for tenant removed.";
          toast.success(state.successMessage);
          state.maintenanceLoading = false;
        }
      )
      .addCase(
        removeModuleFromAllTenants.fulfilled,
        (state, action: PayloadAction<{ deletedCount: number }>) => {
          state.deletedCount = action.payload.deletedCount;
          state.successMessage = "Module removed from all tenants.";
          toast.success(state.successMessage);
          state.maintenanceLoading = false;
        }
      )
      .addCase(
        cleanupOrphanModuleSettings.fulfilled,
        (
          state,
          action: PayloadAction<{
            deletedCount: number;
            orphans: OrphanRecord[];
          }>
        ) => {
          state.deletedCount = action.payload.deletedCount;
          state.orphans = action.payload.orphans;
          state.successMessage = "Orphan module settings cleaned up.";
          toast.success(state.successMessage);
          state.maintenanceLoading = false;
        }
      )
      .addCase(
        batchUpdateModuleSetting.fulfilled,
        (state, action: PayloadAction<MaintenanceLog>) => {
          state.maintenanceLogs = [action.payload];
          state.successMessage = "Batch module update completed.";
          toast.success(state.successMessage);
          state.maintenanceLoading = false;
        }
      )
      // --- PENDING ---
      .addMatcher(
        (action) =>
          action.type.startsWith("moduleMaintenance/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.maintenanceLoading = true;
          state.maintenanceError = null;
          state.successMessage = null;
        }
      )
      // --- REJECTED (ANYACTION YOK) ---
      .addMatcher(
        (action) =>
          action.type.startsWith("moduleMaintenance/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          const payload = (action as any).payload;
          state.maintenanceLoading = false;
          state.maintenanceError =
            typeof payload === "string"
              ? payload
              : (payload &&
                  typeof payload === "object" &&
                  "message" in payload &&
                  payload.message) ||
                "Operation failed.";
          toast.error(state.maintenanceError);
        }
      );
  },
});

export const { clearMaintenanceState } = moduleMaintenanceSlice.actions;
export default moduleMaintenanceSlice.reducer;
