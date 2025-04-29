import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// 🎯 Tipler
export interface Setting {
  _id?: string;
  key: string;
  value: string | string[] | { tr: string; en: string; de: string };
}

// 🎯 State Tipi
interface SettingState {
  settings: Setting[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  fetchedSettings: boolean;
}

// 🎯 Başlangıç State
const initialState: SettingState = {
  settings: [],
  loading: false,
  error: null,
  successMessage: null,
  fetchedSettings: false,
};

// 🎯 Thunklar

export const fetchSettings = createAsyncThunk(
  "setting/fetchSettings",
  async (_, thunkAPI) => {
    try {
      const response = await apiCall("get", "/setting", null, thunkAPI.rejectWithValue);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const upsertSetting = createAsyncThunk(
  "setting/upsertSetting",
  async (
    data: { key: string; value: string | string[] | { tr: string; en: string; de: string } },
    thunkAPI
  ) => {
    try {
      let normalizedValue = data.value;

      // Eğer çok dilli değilse ve key 'site_template' değilse, value'yu tüm dillere uygula
      if (
        typeof data.value === "string" &&
        data.key !== "site_template" &&
        !["tr", "en", "de"].every((lang) => (data.value as any)?.[lang])
      ) {
        normalizedValue = {
          tr: data.value,
          en: data.value,
          de: data.value,
        };
      }

      const response = await apiCall(
        "post",
        "/setting",
        { key: data.key, value: normalizedValue },
        thunkAPI.rejectWithValue
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const deleteSetting = createAsyncThunk(
  "setting/deleteSetting",
  async (key: string, thunkAPI) => {
    try {
      await apiCall("delete", `/setting/${key}`, null, thunkAPI.rejectWithValue);
      return key;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// 🎯 Slice
const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    clearSettingMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<Setting[]>) => {
        state.loading = false;
        state.settings = action.payload;
        state.fetchedSettings = true;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Failed to fetch settings.";
      })

      // ✅ Upsert
      .addCase(upsertSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upsertSetting.fulfilled, (state, action: PayloadAction<Setting>) => {
        state.loading = false;
        state.successMessage = "Setting saved successfully.";
        const updated = action.payload;
        const index = state.settings.findIndex((s) => s.key === updated.key);
        if (index !== -1) {
          state.settings[index] = updated;
        } else {
          state.settings.push(updated);
        }
      })
      .addCase(upsertSetting.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.error = payload?.message || "Failed to save setting.";
      })

      // ✅ Delete
      .addCase(deleteSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSetting.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.successMessage = "Setting deleted successfully.";
        const deletedKey = action.payload;
        state.settings = state.settings.filter((s) => s.key !== deletedKey);
      })
      .addCase(deleteSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Failed to delete setting.";
      });
  },
});

export const { clearSettingMessages } = settingSlice.actions;
export default settingSlice.reducer;
