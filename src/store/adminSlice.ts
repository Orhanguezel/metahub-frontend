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
  updatedBy?: UpdatedBy;
  statsKey?: string; 
  showInDashboard?: boolean; 
}


interface AdminState {
  modules: AdminModule[];
  selectedModule: AdminModule | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  selectedProject: string;
  availableProjects: string[];
}

const initialState: AdminState = {
  modules: [],
  selectedModule: null,
  loading: false,
  error: null,
  successMessage: null,
  selectedProject: "", // <-- önce boş olsun
  availableProjects: [],
};


// ✅ GET /admin/projects
export const fetchAvailableProjects = createAsyncThunk<string[]>(
  "admin/fetchAvailableProjects",
  async (_, thunkAPI) => {
    const response = await apiCall(
      "get",
      "/admin/projects",
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return response.data; // ✅ sadece data dönecek!
  }
);


// ✅ GET /admin/modules
export const fetchAdminModules = createAsyncThunk<{ data: AdminModule[] }, string>(
  "admin/fetchAdminModules",
  async (project, thunkAPI) =>
    await apiCall(
      "get",
      `/admin/modules?project=${project}`,
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    )
);

// ✅ GET /admin/module/:name
export const fetchModuleDetail = createAsyncThunk<
  { data: AdminModule }, 
  { name: string; project: string }
>(
  "admin/fetchModuleDetail",
  async ({ name, project }, thunkAPI) =>
    await apiCall(
      "get",
      `/admin/module/${name}?project=${project}`,
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    )
);


// ✅ POST /admin/modules
export const createAdminModule = createAsyncThunk<AdminModule, {
  name: string;
  icon?: string;
  roles?: string[];
  language?: string;
  visibleInSidebar?: boolean;
  useAnalytics?: boolean;
  enabled?: boolean;
}>(
  "admin/createAdminModule",
  async (payload, thunkAPI) =>
    await apiCall(
      "post",
      "/admin/modules",
      payload,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    )
);

// ✅ PATCH /admin/module/:name
export const updateAdminModule = createAsyncThunk<AdminModule, {
  name: string;
  updates: Partial<AdminModule>;
}>(
  "admin/updateAdminModule",
  async ({ name, updates }, thunkAPI) =>
    await apiCall(
      "patch",
      `/admin/module/${name}`,
      updates,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    )
);

// ✅ DELETE /admin/module/:name
export const deleteAdminModule = createAsyncThunk<string, string>(
  "admin/deleteAdminModule",
  async (name, thunkAPI) =>
    await apiCall(
      "delete",
      `/admin/module/${name}`,
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    )
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
    builder.addCase(fetchAvailableProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.availableProjects = action.payload;
    });

    builder.addCase(fetchAdminModules.fulfilled, (state, action) => {
      state.loading = false;
      state.modules = action.payload.data;
    });
    

    builder.addCase(fetchModuleDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedModule = action.payload.data; 
    });

    builder.addCase(updateAdminModule.fulfilled, (state, action) => {
      state.loading = false;
      const updated = action.payload;
      state.successMessage = `Module "${updated.name}" updated successfully.`;
      state.selectedModule = updated;

      const index = state.modules.findIndex((m) => m.name === updated.name);
      if (index !== -1) {
        state.modules[index] = updated;
      }
    });

    builder.addCase(createAdminModule.fulfilled, (state, action) => {
      state.loading = false;
      const newModule = action.payload;
      state.successMessage = `Module "${newModule.name}" created successfully.`;
      state.modules.push(newModule);
    });

    builder.addCase(deleteAdminModule.fulfilled, (state, action) => {
      state.loading = false;
      const deletedModuleName = action.payload;
      state.successMessage = `Module "${deletedModuleName}" deleted successfully.`;
      state.modules = state.modules.filter((m) => m.name !== deletedModuleName);
      
      if (state.selectedModule?.name === deletedModuleName) {
        state.selectedModule = null;
      }
    
      // 🎉 Başarı bildirimi
      toast.success(`Modül "${deletedModuleName}" başarıyla silindi.`);
    });
    
    builder.addCase(deleteAdminModule.rejected, (state, action) => {
      state.loading = false;
      const errorMessage =
        typeof action.payload === "string"
          ? action.payload
          : "Modül silinemedi. Lütfen tekrar deneyin.";
      
      state.error = errorMessage;
    
      // ❌ Hata bildirimi
      toast.error(errorMessage);
    });

    // ⬇️ Global loading & error matcher
    builder.addMatcher(
      (action): action is PayloadAction<any> =>
        action.type.startsWith("admin/") && action.type.endsWith("/pending"),
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );

    builder.addMatcher(
      (action): action is PayloadAction<any> =>
        action.type.startsWith("admin/") && action.type.endsWith("/rejected"),
      (state, action) => {
        const payload = action.payload;
        state.loading = false;
        state.error =
          typeof payload === "string"
            ? payload
            : typeof payload === "object" && payload?.message
            ? payload.message
            : "Bir hata oluştu.";
      }
    );
  },
});

export const {
  clearAdminMessages,
  setSelectedProject,
  clearSelectedModule,
} = adminSlice.actions;

export default adminSlice.reducer;