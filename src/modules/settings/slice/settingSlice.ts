import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// 🎯 Çeviri tipi
export interface MultiLangValue {
  tr?: string;
  en?: string;
  de?: string;
}

// 🎯 Logo tipi (artık value: { light: {url: string}, dark: {url: string} })
export type LogoSettingValue = {
  light?: { url: string };
  dark?: { url: string };
};

// 🎯 Ayar value tiplerinin tümünü kapsayan union type
export type SettingValue =
  | string
  | string[]
  | MultiLangValue
  | Record<string, MultiLangValue>
  | Record<string, any>
  | LogoSettingValue;

// 🎯 Setting dokümanı
export interface Setting {
  _id?: string;
  key: string;
  value: SettingValue;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 🎯 Redux state tipi
interface SettingState {
  settings: Setting[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  fetchedSettings: boolean;
}

const initialState: SettingState = {
  settings: [],
  loading: false,
  error: null,
  successMessage: null,
  fetchedSettings: false,
};

// ✅ Fetch All
export const fetchSettings = createAsyncThunk(
  "setting/fetchSettings",
  async (_, thunkAPI) => {
    try {
      const response = await apiCall(
        "get",
        "/setting",
        null,
        thunkAPI.rejectWithValue
      );
      // Response data: { success: true, data: [...] }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// ✅ Upsert (text, json vs.)
export const upsertSetting = createAsyncThunk(
  "setting/upsertSetting",
  async (data: { key: string; value: SettingValue }, thunkAPI) => {
    try {
      let normalizedValue = data.value;
      // Sadece düz string ise ve logo değilse, çoklu dil objesine çevir
      if (
        typeof data.value === "string" &&
        !["site_template", "available_themes", "navbar_logos", "footer_logos"].includes(data.key)
      ) {
        normalizedValue = { tr: data.value, en: data.value, de: data.value };
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

// ✅ Delete by Key
export const deleteSetting = createAsyncThunk(
  "setting/deleteSetting",
  async (key: string, thunkAPI) => {
    try {
      await apiCall(
        "delete",
        `/setting/${key}`,
        null,
        thunkAPI.rejectWithValue
      );
      return key;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// ✅ Logo upload (POST)
export const upsertSettingImage = createAsyncThunk(
  "setting/upsertSettingImage",
  async (
    data: { key: string; lightFile?: File; darkFile?: File },
    thunkAPI
  ) => {
    try {
      const formData = new FormData();
      if (["navbar_logos", "footer_logos"].includes(data.key)) {
        if (data.lightFile) formData.append("lightFile", data.lightFile);
        if (data.darkFile) formData.append("darkFile", data.darkFile);
      }
      const response = await apiCall(
        "post",
        `/setting/upload/${data.key}`,
        formData,
        thunkAPI.rejectWithValue,
        { isFormData: true }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// ✅ Logo update (PUT)
export const updateSettingImage = createAsyncThunk(
  "setting/updateSettingImage",
  async (
    data: { key: string; lightFile?: File; darkFile?: File },
    thunkAPI
  ) => {
    try {
      const formData = new FormData();
      if (["navbar_logos", "footer_logos"].includes(data.key)) {
        if (data.lightFile) formData.append("lightFile", data.lightFile);
        if (data.darkFile) formData.append("darkFile", data.darkFile);
      }
      const response = await apiCall(
        "put",
        `/setting/upload/${data.key}`,
        formData,
        thunkAPI.rejectWithValue,
        { isFormData: true }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

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
        state.error =
          (action.payload as any)?.message || "Failed to fetch settings.";
      })

      .addCase(upsertSetting.fulfilled, (state, action: PayloadAction<Setting>) => {
        state.loading = false;
        state.successMessage = "Setting saved successfully.";
        updateOrInsert(state, action.payload);
      })
      .addCase(upsertSettingImage.fulfilled, (state, action: PayloadAction<Setting>) => {
        state.loading = false;
        state.successMessage = "Image uploaded successfully.";
        updateOrInsert(state, action.payload);
      })
      .addCase(updateSettingImage.fulfilled, (state, action: PayloadAction<Setting>) => {
        state.loading = false;
        state.successMessage = "Image updated successfully.";
        updateOrInsert(state, action.payload);
      })
      .addCase(deleteSetting.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.successMessage = "Setting deleted successfully.";
        state.settings = state.settings.filter((s) => s.key !== action.payload);
      })

      // Error matcher
      .addMatcher(
        (action): action is PayloadAction<{ message?: string }> =>
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          const payload = action.payload;
          if (typeof payload === "string") {
            state.error = payload;
          } else if (payload && typeof payload === "object" && "message" in payload) {
            state.error = payload.message || "Operation failed.";
          } else {
            state.error = "Operation failed.";
          }
        }
      );
  },
});

// 🔄 Update or insert by key
function updateOrInsert(state: SettingState, updated: Setting) {
  const index = state.settings.findIndex((s) => s.key === updated.key);
  if (index !== -1) {
    state.settings[index] = updated;
  } else {
    state.settings.push(updated);
  }
}

export const { clearSettingMessages } = settingSlice.actions;
export default settingSlice.reducer;
