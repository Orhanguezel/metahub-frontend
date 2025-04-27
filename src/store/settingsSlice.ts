// src/store/settingsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface Setting {
  _id?: string;
  key: string;
  value: string;
}

interface SettingsState {
  settings: Setting[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: SettingsState = {
  settings: [],
  loading: false,
  error: null,
  successMessage: null,
};

// 🔄 Get all settings
export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, thunkAPI) =>
    await apiCall("get", "/settings", null, thunkAPI.rejectWithValue)
);

// ➕ Create or update setting
export const upsertSetting = createAsyncThunk(
  "settings/upsertSetting",
  async (data: { key: string; value: string }, thunkAPI) =>
    await apiCall("post", "/settings", data, thunkAPI.rejectWithValue)
);

// ❌ Delete setting by key
export const deleteSetting = createAsyncThunk(
  "settings/deleteSetting",
  async (key: string, thunkAPI) =>
    await apiCall("delete", `/settings/${key}`, null, thunkAPI.rejectWithValue)
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearSettingsMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: SettingsState) => {
      state.loading = true;
      state.error = null;
    };

    const errorReducer = (state: SettingsState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // Fetch
      .addCase(fetchSettings.pending, loadingReducer)
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, errorReducer)

      // Upsert
      .addCase(upsertSetting.pending, loadingReducer)
      .addCase(upsertSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Einstellung gespeichert.";

        const updated = action.payload.setting;
        const index = state.settings.findIndex((s) => s.key === updated.key);
        if (index !== -1) {
          state.settings[index] = updated;
        } else {
          state.settings.push(updated);
        }
      })
      .addCase(upsertSetting.rejected, errorReducer)

      // Delete
      .addCase(deleteSetting.pending, loadingReducer)
      .addCase(deleteSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Einstellung gelöscht.";
        state.settings = state.settings.filter((s) => s.key !== action.payload.deleted.key);
      })
      .addCase(deleteSetting.rejected, errorReducer);
  },
});

export const { clearSettingsMessages } = settingsSlice.actions;
export default settingsSlice.reducer;
