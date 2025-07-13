import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { toast } from "react-toastify";
import type { IModuleMeta } from "../types";

// --- STATE TİPİ ---
interface ModuleMetaState {
  modules: IModuleMeta[];
  selectedModule: IModuleMeta | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ModuleMetaState = {
  modules: [],
  selectedModule: null,
  loading: false,
  error: null,
  successMessage: null,
};

// --- ASYNC THUNKS ---

// 1. Create meta
export const createModuleMeta = createAsyncThunk<
  IModuleMeta,
  Partial<IModuleMeta>,
  { rejectValue: string }
>("moduleMeta/create", async (payload, thunkAPI) => {
  try {
    const res = await apiCall(
      "post",
      "/modules/meta",
      payload,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Module creation failed");
  }
});

// 2. Fetch all meta
export const fetchModuleMetas = createAsyncThunk<
  IModuleMeta[],
  void,
  { rejectValue: string }
>("moduleMeta/fetchAll", async (_, thunkAPI) => {
  try {
    const res = await apiCall(
      "get",
      "/modules/meta",
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Fetch failed");
  }
});

// 3. Fetch single meta
export const fetchModuleMetaByName = createAsyncThunk<
  IModuleMeta,
  string,
  { rejectValue: string }
>("moduleMeta/fetchByName", async (name, thunkAPI) => {
  try {
    const res = await apiCall(
      "get",
      `/modules/meta/${name}`,
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Fetch failed");
  }
});

// 4. Update meta
export const updateModuleMeta = createAsyncThunk<
  IModuleMeta,
  { name: string; updates: Partial<IModuleMeta> },
  { rejectValue: string }
>("moduleMeta/update", async ({ name, updates }, thunkAPI) => {
  try {
    const res = await apiCall(
      "patch",
      `/modules/meta/${name}`,
      updates,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Update failed");
  }
});

// 5. Delete meta
export const deleteModuleMeta = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("moduleMeta/delete", async (name, thunkAPI) => {
  try {
    await apiCall(
      "delete",
      `/modules/meta/${name}`,
      null,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    return name;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Delete failed");
  }
});

// 6. Import meta listesi (bulk)
export const importModuleMetas = createAsyncThunk<
  IModuleMeta[],
  IModuleMeta[],
  { rejectValue: string }
>("moduleMeta/importBulk", async (metaArray, thunkAPI) => {
  try {
    const res = await apiCall(
      "post",
      "/modules/meta/bulk-import",
      metaArray,
      thunkAPI.rejectWithValue,
      { withCredentials: true }
    );
    // Eğer backend'de { data: [...] } dönerse ona göre ayarla:
    return res.data?.data ?? res.data ?? [];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? "Bulk import failed");
  }
});

// --- SLICE ---
const moduleMetaSlice = createSlice({
  name: "moduleMeta",
  initialState,
  reducers: {
    clearModuleMetaMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedModule: (state) => {
      state.selectedModule = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        createModuleMeta.fulfilled,
        (state, action: PayloadAction<IModuleMeta>) => {
          state.modules.push(action.payload);
          state.successMessage = `Module "${action.payload.name}" created.`;
          state.loading = false;
          toast.success(state.successMessage);
        }
      )
      .addCase(createModuleMeta.rejected, (state, action: any) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Module creation failed!";
        toast.error(state.error);
      })
      .addCase(fetchModuleMetas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchModuleMetas.fulfilled,
        (state, action: PayloadAction<IModuleMeta[]>) => {
          state.modules = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchModuleMetas.rejected, (state, action: any) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Modules could not be fetched!";
        toast.error(state.error);
      })
      .addCase(fetchModuleMetaByName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchModuleMetaByName.fulfilled,
        (state, action: PayloadAction<IModuleMeta>) => {
          state.selectedModule = action.payload;
          state.loading = false;
        }
      )
      .addCase(updateModuleMeta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateModuleMeta.fulfilled,
        (state, action: PayloadAction<IModuleMeta>) => {
          const idx = state.modules.findIndex(
            (m) => m.name === action.payload.name
          );
          if (idx !== -1) state.modules[idx] = action.payload;
          state.selectedModule = action.payload;
          state.successMessage = "Module meta updated.";
          toast.success(state.successMessage);
          state.loading = false;
        }
      )
      .addCase(updateModuleMeta.rejected, (state, action: any) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.payload ||
          "Module meta could not be updated!";
        toast.error(state.error);
      })
      .addCase(deleteModuleMeta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteModuleMeta.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.modules = state.modules.filter(
            (m) => m.name !== action.payload
          );
          state.successMessage = "Module meta deleted.";
          toast.success(state.successMessage);
          state.loading = false;
        }
      )
      .addCase(importModuleMetas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        importModuleMetas.fulfilled,
        (state, action: PayloadAction<IModuleMeta[]>) => {
          state.modules = action.payload;
          state.successMessage = "Module metas imported successfully.";
          toast.success(state.successMessage);
          state.loading = false;
        }
      )
      // --- Matcherlar EN SONDA ---
      .addMatcher(
        (action) =>
          action.type.startsWith("moduleMeta/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("moduleMeta/") &&
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

export const { clearModuleMetaMessages, clearSelectedModule } =
  moduleMetaSlice.actions;
export default moduleMetaSlice.reducer;
