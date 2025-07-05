import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { SUPPORTED_LOCALES } from "@/i18n";
import type { ISetting, ISettingValue } from "../types";
import type { TranslatedLabel } from "@/types/common";

interface SettingsState {
  settings: ISetting[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  fetchedSettings: boolean;
}

const initialState: SettingsState = {
  settings: [],
  loading: false,
  error: null,
  successMessage: null,
  fetchedSettings: false,
};

// --- Thunk Types ---
interface UpsertSettingArgs {
  key: string;
  value: ISettingValue;
  isActive?: boolean;
}

interface UpsertSettingImageArgs {
  key: string;
  lightFile?: File;
  darkFile?: File;
}

// --- Thunks ---

export const fetchSettings = createAsyncThunk<
  ISetting[],
  void,
  { rejectValue: string }
>("settings/fetchSettings", async (_, thunkAPI) => {
  try {
    const response = await apiCall(
      "get",
      "/settings",
      null,
      thunkAPI.rejectWithValue
    );
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.message || "Failed to fetch settings."
    );
  }
});

interface UpsertResponse {
  message: string;
  data: ISetting;
}

export const upsertSettings = createAsyncThunk<
  UpsertResponse,
  UpsertSettingArgs,
  { rejectValue: string }
>("settings/upsertSettings", async (data, thunkAPI) => {
  try {
    let normalizedValue = data.value;
    if (
      typeof data.value === "string" &&
      ![
        "site_template",
        "available_themes",
        "navbar_logos",
        "footer_logos",
      ].includes(data.key)
    ) {
      normalizedValue = SUPPORTED_LOCALES.reduce(
        (acc, lng) => ({ ...acc, [lng]: data.value }),
        {} as TranslatedLabel
      );
    }
    const response = await apiCall(
      "post",
      "/settings",
      { key: data.key, value: normalizedValue, isActive: data.isActive },
      thunkAPI.rejectWithValue
    );
    return response;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error?.message || "Upsert failed.");
  }
});

export const deleteSettings = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("settings/deleteSettings", async (key, thunkAPI) => {
  try {
    await apiCall("delete", `/settings/${key}`, null, thunkAPI.rejectWithValue);
    return key;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error?.message || "Delete failed.");
  }
});

export const upsertSettingsImage = createAsyncThunk<
  UpsertResponse,
  UpsertSettingImageArgs,
  { rejectValue: string }
>("settings/upsertSettingsImage", async (data, thunkAPI) => {
  try {
    const formData = new FormData();
    if (data.lightFile) formData.append("lightFile", data.lightFile);
    if (data.darkFile) formData.append("darkFile", data.darkFile);
    const response = await apiCall(
      "post",
      `/settings/upload/${data.key}`,
      formData,
      thunkAPI.rejectWithValue,
      { isFormData: true }
    );
    return response;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error?.message || "Image upload failed.");
  }
});

export const updateSettingsImage = createAsyncThunk<
  UpsertResponse,
  UpsertSettingImageArgs,
  { rejectValue: string }
>("settings/updateSettingsImage", async (data, thunkAPI) => {
  try {
    const formData = new FormData();
    if (data.lightFile) formData.append("lightFile", data.lightFile);
    if (data.darkFile) formData.append("darkFile", data.darkFile);
    const response = await apiCall(
      "put",
      `/settings/upload/${data.key}`,
      formData,
      thunkAPI.rejectWithValue,
      { isFormData: true }
    );
    return response;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error?.message || "Image update failed.");
  }
});

// --- Helper: update or insert ---
function updateOrInsert(state: SettingsState, payload: ISetting) {
  const index = state.settings.findIndex((s) => s.key === payload.key);
  if (index !== -1) {
    state.settings[index] = payload;
  } else {
    state.settings.push(payload);
  }
}

// --- Slice ---
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
      state.fetchedSettings = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
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

      // --- Upsert Setting ---
      .addCase(upsertSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload.message || "Setting saved successfully.";
        updateOrInsert(state, action.payload.data);
      })

      // --- Upsert Setting Image ---
      .addCase(upsertSettingsImage.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload.message || "Image uploaded successfully.";
        updateOrInsert(state, action.payload.data);
      })

      // --- Update Setting Image ---
      .addCase(updateSettingsImage.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload.message || "Image updated successfully.";
        updateOrInsert(state, action.payload.data);
      })

      // --- Delete Setting ---
      .addCase(deleteSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Setting deleted successfully.";
        state.settings = state.settings.filter((s) => s.key !== action.payload);
      })

      // --- Global Error Handler ---
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          const payload = (action as any).payload;
          state.loading = false;
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

export const { clearSettingsMessages, clearSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
