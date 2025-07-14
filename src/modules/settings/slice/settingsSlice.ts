import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ISetting } from "../types";
import { SUPPORTED_LOCALES } from "@/i18n";
import type { TranslatedLabel } from "@/types/common";

interface SettingsState {
  settings: ISetting[];         // Public (client)
  settingsAdmin: ISetting[];    // Admin (panel)
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
  fetchedSettings: boolean;
}

const initialState: SettingsState = {
  settings: [],
  settingsAdmin: [],
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
  fetchedSettings: false,
};

// --- THUNKS ---
// 1️⃣ Public: Get All Settings
export const fetchSettings = createAsyncThunk<
  ISetting[],
  void,
  { rejectValue: string }
>("settings/fetchSettings", async (_, thunkAPI) => {
  try {
    const res = await apiCall("get", "/settings", null, thunkAPI.rejectWithValue);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to fetch settings.");
  }
});

// 2️⃣ Admin: Get All Settings
export const fetchSettingsAdmin = createAsyncThunk<
  ISetting[],
  void,
  { rejectValue: string }
>("settings/fetchSettingsAdmin", async (_, thunkAPI) => {
  try {
    const res = await apiCall("get", "/settings/admin", null, thunkAPI.rejectWithValue);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Failed to fetch admin settings.");
  }
});

// 3️⃣ Upsert Setting (admin)
export const upsertSettings = createAsyncThunk<
  { message: string; data: ISetting },
  { key: string; value: any; isActive?: boolean },
  { rejectValue: string }
>("settings/upsertSettings", async (data, thunkAPI) => {
  try {
    let normalizedValue = data.value;
    // TranslatedLabel key ise, otomatik objeye çevir
    if (
      typeof data.value === "string" &&
      !["site_template", "available_themes", "logo_images", "images", "footer_images", "navbar_images"].includes(data.key)
    ) {
      normalizedValue = SUPPORTED_LOCALES.reduce(
        (acc, lng) => ({ ...acc, [lng]: data.value }),
        {} as TranslatedLabel
      );
    }
    const res = await apiCall(
      "post",
      "/settings/admin",
      { key: data.key, value: normalizedValue, isActive: data.isActive },
      thunkAPI.rejectWithValue
    );
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Upsert failed.");
  }
});

// 4️⃣ Delete Setting (admin)
export const deleteSettings = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("settings/deleteSettings", async (key, thunkAPI) => {
  try {
    await apiCall("delete", `/settings/admin/${key}`, null, thunkAPI.rejectWithValue);
    return key;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Delete failed.");
  }
});

// 5️⃣ Upsert Images (admin, POST)
export const upsertSettingsImage = createAsyncThunk<
  { message: string; data: ISetting },
  { key: string; files: File[] },
  { rejectValue: string }
>("settings/upsertSettingsImage", async (data, thunkAPI) => {
  try {
    const formData = new FormData();
    data.files.forEach((file) => formData.append("images", file));
    const res = await apiCall(
      "post",
      `/settings/admin/upload/${data.key}`,
      formData,
      thunkAPI.rejectWithValue,
      { isFormData: true }
    );
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Image upload failed.");
  }
});

// 6️⃣ Update Images (admin, PUT)
export const updateSettingsImage = createAsyncThunk<
  { message: string; data: ISetting },
  { key: string; files: File[]; removedImages?: string[] },
  { rejectValue: string }
>("settings/updateSettingsImage", async (data, thunkAPI) => {
  try {
    const formData = new FormData();
    data.files.forEach((file) => formData.append("images", file));
    if (data.removedImages)
      formData.append("removedImages", JSON.stringify(data.removedImages));
    const res = await apiCall(
      "put",
      `/settings/admin/upload/${data.key}`,
      formData,
      thunkAPI.rejectWithValue,
      { isFormData: true }
    );
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || "Image update failed.");
  }
});

// --- Helper: Admin State Update ---
function updateOrInsert(state: SettingsState, payload: ISetting) {
  const index = state.settingsAdmin.findIndex((s) => s.key === payload.key);
  if (index !== -1) {
    state.settingsAdmin[index] = payload;
  } else {
    state.settingsAdmin.push(payload);
  }
}

// --- SLICE ---
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearSettingsMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSettings: (state) => {
      state.settings = [];
      state.settingsAdmin = [];
      state.fetchedSettings = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // PUBLIC GET
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.fetchedSettings = true;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch settings.";
      })
      // ADMIN GET
      .addCase(fetchSettingsAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettingsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.settingsAdmin = action.payload;
        state.fetchedSettings = true;
      })
      .addCase(fetchSettingsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch admin settings.";
      })
      // UPSERT
      .addCase(upsertSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Setting saved successfully.";
        updateOrInsert(state, action.payload.data);
      })
      // IMAGE UPSERT
      .addCase(upsertSettingsImage.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Image uploaded successfully.";
        updateOrInsert(state, action.payload.data);
      })
      // IMAGE UPDATE
      .addCase(updateSettingsImage.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Image updated successfully.";
        updateOrInsert(state, action.payload.data);
      })
      // DELETE
      .addCase(deleteSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Setting deleted successfully.";
        state.settingsAdmin = state.settingsAdmin.filter((s) => s.key !== action.payload);
      })
      // Global Error Handler
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          const payload = (action as any).payload;
          state.loading = false;
          state.error =
            typeof payload === "string"
              ? payload
              : (payload && typeof payload === "object" && "message" in payload && payload.message) ||
                "Operation failed.";
        }
      );
  },
});

export const { clearSettingsMessages, clearSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
