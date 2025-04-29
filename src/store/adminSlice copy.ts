import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { toast } from "react-toastify";

// ✅ Tipler
interface RouteMeta {
  method: string;
  path: string;
  auth?: boolean;
  summary?: string;
}

interface HistoryEntry {
  version: string;
  by: string;
  date: string;
  note: string;
}

interface UpdatedBy {
  username: string;
  commitHash: string;
}

interface Label {
  tr: string;
  en: string;
  de: string;
}

export interface AdminModule {
  name: string;
  label: Label;
  icon: string;
  roles: string[];
  enabled: boolean;
  visibleInSidebar: boolean;
  useAnalytics: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  routes: RouteMeta[];
  history?: HistoryEntry[];
  language?: string;
  order?: number;
  updatedBy?: UpdatedBy;
  statsKey?: string;
  showInDashboard?: boolean;
  stats?: {
    [key: string]: {
      count: number;
      lastUpdatedAt: string;
    };
  };
  [key: string]: any;
  message?: string;
  error?: string;
  success?: boolean;
  loading?: boolean;
}

export interface ModuleAnalyticsItem {
  name: string;
  label: Label;
  icon: string;
  count: number;
}

interface AdminState {
  modules: AdminModule[];
  selectedModule: AdminModule | null;
  moduleAnalytics: ModuleAnalyticsItem[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  selectedProject: string;
  availableProjects: string[];

}

// ✅ Başlangıç State
const initialState: AdminState = {
  modules: [],
  selectedModule: null,
  moduleAnalytics: [],
  loading: false,
  error: null,
  successMessage: null,
  selectedProject: "",
  availableProjects: [],
};

// ✅ Thunklar

// 📁 Proje listesi
export const fetchAvailableProjects = createAsyncThunk<string[]>(
  "admin/fetchAvailableProjects",
  async (_, thunkAPI) => {
    const response = await apiCall("get", "/admin/projects", null, thunkAPI.rejectWithValue, { withCredentials: true });
    return response.data;
  }
);

// 📄 Modül listesi
export const fetchAdminModules = createAsyncThunk<{ data: AdminModule[] }, string>(
  "admin/fetchAdminModules",
  async (project, thunkAPI) =>
    await apiCall("get", `/admin/modules?project=${project}`, null, thunkAPI.rejectWithValue, { withCredentials: true })
);

// 📄 Tekil modül detayı
export const fetchModuleDetail = createAsyncThunk<{ data: AdminModule }, { name: string; project: string }>(
  "admin/fetchModuleDetail",
  async ({ name, project }, thunkAPI) =>
    await apiCall("get", `/admin/module/${name}?project=${project}`, null, thunkAPI.rejectWithValue, { withCredentials: true })
);

// 📈 Tüm modüllerin analytics verisi
export const fetchAllModulesAnalytics = createAsyncThunk<{ data: ModuleAnalyticsItem[] }>(
  "admin/fetchAllModulesAnalytics",
  async (_, thunkAPI) =>
    await apiCall("get", "/admin/modules/analytics", null, thunkAPI.rejectWithValue, { withCredentials: true })
);

// ➕ Yeni modül oluştur
export const createAdminModule = createAsyncThunk<AdminModule, Partial<AdminModule>>(
  "admin/createAdminModule",
  async (payload, thunkAPI) =>
    await apiCall("post", "/admin/modules", payload, thunkAPI.rejectWithValue, { withCredentials: true })
);

// ✏️ Modül güncelle
export const updateAdminModule = createAsyncThunk<AdminModule, { name: string; updates: Partial<AdminModule> }>(
  "admin/updateAdminModule",
  async ({ name, updates }, thunkAPI) =>
    await apiCall("patch", `/admin/module/${name}`, updates, thunkAPI.rejectWithValue, { withCredentials: true })
);

// ❌ Modül sil
export const deleteAdminModule = createAsyncThunk<string, string>(
  "admin/deleteAdminModule",
  async (name, thunkAPI) =>
    await apiCall("delete", `/admin/module/${name}`, null, thunkAPI.rejectWithValue, { withCredentials: true })
);

// 🧠 Slice
const adminSlice = createSlice({
  name: "admin",
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
      .addCase(fetchAvailableProjects.fulfilled, (state, action) => {
        state.availableProjects = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdminModules.fulfilled, (state, action) => {
        state.modules = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchModuleDetail.fulfilled, (state, action) => {
        state.selectedModule = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchAllModulesAnalytics.fulfilled, (state, action) => {
        state.moduleAnalytics = action.payload.data;
        state.loading = false;
      })
      .addCase(createAdminModule.fulfilled, (state, action) => {
        state.modules.push(action.payload);
        state.successMessage = `Module "${action.payload.name}" created successfully.`;
        state.loading = false;
      })
      .addCase(updateAdminModule.fulfilled, (state, action) => {
        const updatedModule = action.payload;
        const index = state.modules.findIndex((m) => m.name === updatedModule.name);
        if (index !== -1) {
          state.modules[index] = updatedModule;
        }
        state.selectedModule = updatedModule;
        state.successMessage = `Module "${updatedModule.name}" updated successfully.`;
        state.loading = false;
      })
      .addCase(deleteAdminModule.fulfilled, (state, action) => {
        const deletedModuleName = action.payload;
        state.modules = state.modules.filter((m) => m.name !== deletedModuleName);
        if (state.selectedModule?.name === deletedModuleName) {
          state.selectedModule = null;
        }
        state.successMessage = `Module "${deletedModuleName}" deleted successfully.`;
        state.loading = false;
        toast.success(`Modül "${deletedModuleName}" başarıyla silindi.`);
      })
      .addMatcher(
        (action): action is PayloadAction<any> =>
          action.type.startsWith("admin/") && action.type.endsWith("/rejected"),
        (state, action) => {
          const payload = action.payload;
          state.error =
            typeof payload === "string"
              ? payload
              : typeof payload === "object" && payload !== null && "message" in payload
              ? (payload as any).message
              : "Bir hata oluştu.";
          state.loading = false;
        }
      )
      
      .addMatcher(
        (action): action is PayloadAction<any> =>
          action.type.startsWith("admin/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action): action is PayloadAction<any> =>
          action.type.startsWith("admin/") && action.type.endsWith("/rejected"),
        (state, action) => {
          const payload = action.payload;
          state.error =
            typeof payload === "string"
              ? payload
              : payload?.message || "Bir hata oluştu.";
          state.loading = false;
        }
      );
  },
});

// ✅ Exportlar
export const { clearAdminMessages, setSelectedProject, clearSelectedModule } = adminSlice.actions;
export default adminSlice.reducer;
