import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { toast } from "react-toastify";
import { AdminModule, ModuleAnalyticsItem } from "../types";

// --- State Tipi ---
interface AdminState {
  modules: AdminModule[];
  selectedModule: AdminModule | null;
  moduleAnalytics: ModuleAnalyticsItem[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  selectedProject: string;
  availableProjects: string[];
  fetchedAvailableProjects: boolean;
}

const initialState: AdminState = {
  modules: [],
  selectedModule: null,
  moduleAnalytics: [],
  loading: false,
  error: null,
  successMessage: null,
  selectedProject: "",
  availableProjects: [],
  fetchedAvailableProjects: false,
};

// --- Thunklar (API uyumlu) ---

// 1. Proje listesi
export const fetchAvailableProjects = createAsyncThunk<string[]>(
  "admin/fetchAvailableProjects",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/admin/projects",
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data ?? [];
  }
);

// 2. Modül listesi
export const fetchAdminModules = createAsyncThunk<AdminModule[], string>(
  "admin/fetchAdminModules",
  async (project, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/admin/modules?project=${project}`,
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data ?? [];
  }
);

// 3. Tek modül detay
export const fetchModuleDetail = createAsyncThunk<
  AdminModule,
  { name: string; project: string }
>("admin/fetchModuleDetail", async ({ name, project }, thunkAPI) => {
  const res = await apiCall(
    "get",
    `/admin/module/${name}?project=${project}`,
    null,
    thunkAPI.rejectWithValue,
    { withCredentials: true }
  );
  return res.data;
});

// 4. Modül oluştur
export const createAdminModule = createAsyncThunk<
  AdminModule,
  Partial<AdminModule>
>("admin/createAdminModule", async (payload, thunkAPI) => {
  const res = await apiCall(
    "post",
    "/admin/modules",
    payload,
    thunkAPI.rejectWithValue,
    { withCredentials: true }
  );
  return res.data;
});

// 5. Modül güncelle
export const updateAdminModule = createAsyncThunk<
  AdminModule,
  { name: string; updates: Partial<AdminModule> }
>("admin/updateAdminModule", async ({ name, updates }, thunkAPI) => {
  const res = await apiCall(
    "patch",
    `/admin/module/${name}`,
    updates,
    thunkAPI.rejectWithValue,
    { withCredentials: true }
  );
  return res.data;
});

// 6. Modül sil
export const deleteAdminModule = createAsyncThunk<
  string,
  { name: string; project: string }
>("admin/deleteAdminModule", async ({ name, project }, thunkAPI) => {
  await apiCall(
    "delete",
    `/admin/module/${name}?project=${project}`,
    null,
    thunkAPI.rejectWithValue,
    { withCredentials: true }
  );
  return name;
});

// 7. Analytics toggle
export const toggleModuleAnalytics = createAsyncThunk<
  AdminModule,
  { name: string; value: boolean; project: string }
>("admin/toggleModuleAnalytics", async ({ name, value, project }, thunkAPI) => {
  const res = await apiCall(
    "patch",
    `/admin/modules/${name}/toggle-analytics`,
    { value, project },
    thunkAPI.rejectWithValue,
    { withCredentials: true }
  );
  return res.data.meta; // backend response: { meta, setting }
});

// 8. Modül Flag değiştir
export const toggleAdminModuleFlag = createAsyncThunk<
  AdminModule,
  { name: string; key: keyof AdminModule }
>("admin/toggleAdminModuleFlag", async ({ name, key }, thunkAPI) => {
  const res = await apiCall(
    "patch",
    `/admin/module/${name}/toggle`,
    { key },
    thunkAPI.rejectWithValue,
    { withCredentials: true }
  );
  return res.data;
});

// --- Slice ---
const adminModuleSlice = createSlice({
  name: "adminModule",
  initialState,
  reducers: {
    clearAdminMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedProject: (state, action: PayloadAction<string>) => {
      state.selectedProject = action.payload;
    },
    clearSelectedModule: (state) => {
      state.selectedModule = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Proje listesi
      .addCase(fetchAvailableProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableProjects.fulfilled, (state, action) => {
        state.availableProjects = action.payload;
        state.fetchedAvailableProjects = true;
        state.loading = false;
      })
      .addCase(fetchAvailableProjects.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.payload as any)?.message;
      })

      // Modül listesi
      .addCase(fetchAdminModules.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminModules.fulfilled, (state, action) => {
        state.modules = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdminModules.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.payload as any)?.message ||
              "Beklenmeyen bir hata oluştu!";
      })

      // Tek modül detay
      .addCase(fetchModuleDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchModuleDetail.fulfilled, (state, action) => {
        state.selectedModule = action.payload;
        state.loading = false;
      })
      .addCase(fetchModuleDetail.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.payload as any)?.message;
      })

      // Modül oluştur
      .addCase(createAdminModule.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAdminModule.fulfilled, (state, action) => {
        state.modules.push(action.payload);
        state.successMessage = `Module "${action.payload.name}" created successfully.`;
        state.loading = false;
        toast.success(state.successMessage);
      })
      .addCase(createAdminModule.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.payload as any)?.message;
      })

      // Modül güncelle
      .addCase(updateAdminModule.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAdminModule.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.modules.findIndex((m) => m.name === updated.name);
        if (idx !== -1) state.modules[idx] = updated;
        state.selectedModule = updated;
        state.successMessage = `Module "${updated.name}" updated successfully.`;
        state.loading = false;
        toast.success(state.successMessage);
      })
      .addCase(updateAdminModule.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.payload as any)?.message;
      })

      // Modül sil
      .addCase(deleteAdminModule.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAdminModule.fulfilled, (state, action) => {
        state.modules = state.modules.filter((m) => m.name !== action.payload);
        if (state.selectedModule?.name === action.payload)
          state.selectedModule = null;
        state.successMessage = `Module "${action.payload}" deleted successfully.`;
        state.loading = false;
        toast.success(state.successMessage);
      })
      .addCase(deleteAdminModule.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.payload as any)?.message;
      })

      // Analytics toggle
      .addCase(toggleModuleAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleModuleAnalytics.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.modules.findIndex((m) => m.name === updated.name);
        if (idx !== -1) state.modules[idx] = updated;
        state.selectedModule = updated;
        state.successMessage = `Module "${updated.name}" analytics toggled successfully.`;
        state.loading = false;
        toast.success(state.successMessage);
      })
      .addCase(toggleModuleAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.payload as any)?.message;
      })

      // Modül flag toggle
      .addCase(toggleAdminModuleFlag.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleAdminModuleFlag.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.modules.findIndex((m) => m.name === updated.name);
        if (idx !== -1) state.modules[idx] = updated;
        state.selectedModule = updated;
        state.successMessage = `Module "${updated.name}" flag toggled successfully.`;
        state.loading = false;
        toast.success(state.successMessage);
      })
      .addCase(toggleAdminModuleFlag.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.payload as any)?.message;
      });
  },
});

export const { clearAdminMessages, setSelectedProject, clearSelectedModule } =
  adminModuleSlice.actions;
export default adminModuleSlice.reducer;
